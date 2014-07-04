'use strict';

/* Services */
angular.module('spotlistr.services', [])
	.value('version', '1.0')
	.factory('UserFactory', function($http, $rootScope) {
		return {
			currentUser: function() {
				return JSON.parse(window.localStorage.getItem('currentUser'));
			},
			setCurrentUser: function(userJson) {
				window.localStorage.setItem('currentUser', JSON.stringify(userJson));
			},
			getUserId: function() {
				var user = this.currentUser();
				return user.id;
			},
			userLoggedIn: function() {
				return this.currentUser() !== null && this.currentUser() !== undefined && this.currentUser() != "null";
			},
			getAccessToken: function() {
				return window.localStorage.getItem('access_token');
			},
			setAccessToken: function(access_token) {
				window.localStorage.setItem('access_token', access_token);
			},
			getRefreshToken: function() {
				return window.localStorage.getItem('refresh_token');
			},
			setRefreshToken: function(refresh_token) {
				window.localStorage.setItem('refresh_token', refresh_token);
			},
			getNewAccessToken: function(successCallback, errorCallback) {
				$http.get('/refresh_token?refresh_token=' + this.getRefreshToken()).success(successCallback).error(errorCallback);
			},
			getSpotifyUserInfo: function() {
				var _this = this;
				$http.defaults.headers.common.Authorization = 'Bearer ' + this.getAccessToken();
				$http.get('https://api.spotify.com/v1/me').success(function(response) {
					// Update the stored data
					_this.setCurrentUser(response);
					_this.broadcastUserStateChanged();
				});
			},
			clearUserData: function() {
				window.localStorage.removeItem('currentUser');
				window.localStorage.removeItem('access_token');
				window.localStorage.removeItem('refresh_token');
				this.broadcastUserStateChanged();
			},
			broadcastUserStateChanged: function() {
				// Broadcast the event so that the menu can to consume it
				// along with any other controllers that may be consuming it
				$rootScope.$broadcast('userChanged', {
					'currentUser': this.currentUser(),
					'userLoggedIn': this.userLoggedIn()
				});
			}
		}
	})
	.factory('SpotifySearchFactory', function($http) {
		return {
			search: function(track) {
				// https://developer.spotify.com/web-api/search-item/
				var req = 'https://api.spotify.com/v1/search?type=track&limit=8&q=' + encodeURIComponent(track.cleanedQuery);
				$http.get(req).success(function(response) {
					track.addSpotifyMatches(response.tracks.items);
					console.log(track);
				});
			}
		}
	})
	.factory('SpotifyPlaylistFactory', function($http, UserFactory, QueryFactory) {
		return {
			create: function(name, user_id, access_token, is_public, callback, errorCallback) {
				$http.defaults.headers.common.Authorization = 'Bearer ' + access_token;
				// https://developer.spotify.com/web-api/create-playlist/
				// Endpoint: POST https://api.spotify.com/v1/users/{user_id}/playlists
				$http.post(
					'https://api.spotify.com/v1/users/' + encodeURIComponent(user_id) + '/playlists',
					{
						'name' : name,
						'public' : is_public
					}
				).success(callback).error(errorCallback);
			},
			addTracks: function(user_id, playlist_id, access_token, arr, callback) {
				var _this = this,
					SPOTIFY_TRACK_LIMIT = 100;
				// https://developer.spotify.com/web-api/add-tracks-to-playlist/
				// POST https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks
				$http.defaults.headers.common.Authorization = 'Bearer ' + access_token;
				if (arr.length > SPOTIFY_TRACK_LIMIT) {
					// Spotify limits to adding 100 songs at a time
					// So we'll batch submit in 100 track subsets
					for (var i = 0; i * SPOTIFY_TRACK_LIMIT < arr.length; i += 1) {
						_this.handleSubmitTracksToPlaylist(arr.slice(i * SPOTIFY_TRACK_LIMIT, (i + 1) * SPOTIFY_TRACK_LIMIT), user_id, playlist_id, callback);
					}
				} else {
					_this.handleSubmitTracksToPlaylist(arr, user_id, playlist_id, callback);
				}
			},
			handleSubmitTracksToPlaylist: function(arr, user_id, playlist_id, callback) {
				$http.post('https://api.spotify.com/v1/users/' + encodeURIComponent(user_id) + '/playlists/' + encodeURIComponent(playlist_id) + '/tracks?uris=' + arr.join(",")).success(callback);
			},
			createPlaylist: function(name, isPublic, trackArr, messages) {
				// Clear the array, but keep the reference
				messages.length = 0;
				var _this = this,
					playlist = QueryFactory.gatherPlaylist(trackArr),
					successCallback = function(response) {
						if (response.id) {
							var playlistId = response.id;
							_this.addTracks(UserFactory.getUserId(), response.id, UserFactory.getAccessToken(), playlist, function(response) {
								_this.addSuccess(messages, 'Successfully created your playlist! Check your Spotify client to view it!');
							});
						} else {
							_this.addError(messages, 'Error while creating playlist on Spotify');
						}
					},
					errorCallback = function(data, status, headers, config) {
						if (status === 401) {
							// 401 unauthorized
							// The token needs to be refreshed
							UserFactory.getNewAccessToken(function(newTokenResponse) {
								UserFactory.setAccessToken(newTokenResponse.access_token);
								// Call the create new playlist function again
								// since we now have the proper access token
								_this.create(name, UserFactory.getUserId(), UserFactory.getAccessToken(), isPublic, successCallback, errorCallback);
							}, function(data, status, headers, config) {
								_this.addError(messages, data.error.message);
							});
						} else {
							_this.addError(messages, data.error.message);
						}
					};
				_this.create(name, UserFactory.getUserId(), UserFactory.getAccessToken(), isPublic, successCallback, errorCallback);
			},
			addError: function(messages, message) {
				messages.push({
					'status': 'error',
					'message': message
				});
			},
			addSuccess: function(messages, message) {
				messages.push({
					'status': 'success',
					'message': message
				});
			}
		}
	})
	.factory('QueryFactory', function(SpotifySearchFactory) {
		return {
			normalizeSearchQuery: function(query) {
				var normalized = query;
				// Remove any genre tags in the formation [genre]
				// NOTE: This is pretty naive
				normalized = normalized.replace(/\[(\w*|\s*|\/|-)+\]/gi, '');
				// Remove the time listings in the format [hh:mm:ss]
				normalized = normalized.replace(/(\[(\d*)?:?\d+:\d+\])/, '');
				// Remove the year tags in the format [yyyy] or (yyyy)
				normalized = normalized.replace(/(\[|\()+\d*(\]|\))+/, '');
				// Remove all the extraneous stuff
				normalized = normalized.replace(/[^\w\s]/gi, '');
				return normalized;
			},
			normalizeSearchArray: function(arr) {
				var normalizedArray = new Array(arr.length);
				for (var i = 0; i < arr.length; i += 1) {
					normalizedArray[i] = this.normalizeSearchQuery(arr[i]);
				}
				return normalizedArray;
			},
			createDisplayName: function(track) {
				var result = '';
				for (var i = 0; i < track.artists.length; i += 1) {
					if (i < track.artists.length - 1) {
						result += track.artists[i].name + ', ';
					} else {
						result += track.artists[i].name;
					}
				}
				result += ' - ' + track.name;
				return result;
			},
			createSpotifyUriFromTrackId: function(id) {
				return 'spotify:track:' + id;
			},
			performSearch: function(trackArr) {
				for (var i = 0; i < trackArr.length; i += 1) {
					SpotifySearchFactory.search(trackArr[i]);
				}
			},
			assignSelectedTrack: function(track, index) {
				track.setSelectedMatch(index);
			},
			gatherPlaylist: function(trackArr) {
				var playlist = [],
					currentItem;
				for (var i = 0; i < trackArr.length; i += 1) {
					currentItem = trackArr[i];
					if (currentItem.spotifyMatches.length === 1) {
						// Exact match
						playlist.push(currentItem.createSpotifyUriFromTrackId(currentItem.spotifyMatches[0].id));
					} else if (currentItem.spotifyMatches.length > 1) {
						// Push the selected match of the multiple matches
						playlist.push(currentItem.createSpotifyUriFromTrackId(currentItem.spotifyMatches[currentItem.selectedMatch].id));
					}
					// Do not push the given track if we did not find any matches on Spotify
				}
				// TODO: Do something better with the ones that we couldn't find
				return playlist;
			}
		}
	})
	.factory('RedditFactory', function($http) {
		return {
			getSubreddit: function(subreddit, sort, t, fetchAmount, callback) {
				// http://www.reddit.com/r/trap/hot.json
				var req = 'http://www.reddit.com/r/' + subreddit + '/' + sort + '.json?limit=' + fetchAmount;
				if (t) {
					req += '&' + t;
				}
				console.log(req);
				$http.get(req).success(callback);
			}
		}
	})
	.factory('LastfmFactory', function($http, $q) {
		return {
			apiKey: '0fa55d46c0a036a3f785cdd768fadbba',
			getSimilarTracksAndExtractInfo: function(inputByLine, similarCount, callback) {
				var _this = this,
					lastfmSimilarTracks = [],
					splitTrack = [];

				var promises = inputByLine.map(function(value) {
					var deferred = $q.defer();
					// We are expecting input to be in the format Arist - Track Title
					splitTrack = value.split('-');
					// Async task
					var req = 'http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=' + encodeURIComponent(splitTrack[0]) + '&track=' + encodeURIComponent(splitTrack[1]) + '&api_key=' + _this.apiKey + '&limit=' + similarCount + '&format=json';
					$http.get(req).success(function(response) {
						deferred.resolve(response);
					}).error(function() {
						deferred.reject();
					});
					return deferred.promise;
				});

				$q.all(promises).then(callback);
			},
			getUserTopTracks: function(username, period, callback) {
				// http://www.last.fm/api/show/user.getTopTracks
				// http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=rj&api_key=0fa55d46c0a036a3f785cdd768fadbba&format=json
				var _this = this;

				var req = 'http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user='+ encodeURIComponent(username) + '&api_key=' + _this.apiKey + '&period=' + period + '&format=json';

				$http.get(req).success(callback);
			},
			extractInfoFromLastfmResults: function(results) {
				var extracted = [];
				if (results.track instanceof Array) {
					for (var j = 0; j < results.track.length; j++) {
						extracted.push(results.track[j].artist.name + ' ' + results.track[j].name);
					}
				}
				return extracted;
			},
		}
	})
	.factory('YouTubeFactory', function($http, $q) {
		return {
			apiKey: 'AIzaSyDh-yB1krW7TFjW30TYhLJLL-dZ90zOraY',
			getPlaylist: function(playlistId, callback) {
				var _this = this,
					results = [];

				_this.getVideosFromPlaylist(playlistId, results, null, callback);
			},
			getVideosFromPlaylist: function(playlistId, results, nextPageToken, callback) {
				// Docs: https://developers.google.com/youtube/v3/docs/playlistItems/list
				// endpoint: GET https://www.googleapis.com/youtube/v3/playlistItems
				var _this = this,
					req = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' + playlistId + '&maxResults=50&key=' + _this.apiKey;

				if (nextPageToken) {
					req += '&pageToken=' + nextPageToken;
				}
				$http.get(req).success(function(res) {
					for (var i = 0; i < res.items.length; i += 1) {
						results.push(res.items[i]);
					}

					if (res.nextPageToken) {
						_this.getVideosFromPlaylist(playlistId, results, res.nextPageToken, callback);
					} else {
						callback(results);
					}
				});
			},
		}
	});
