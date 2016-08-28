'use strict';

/* Services */
angular.module('spotlistr.services', [])
	.value('version', '1.12.2')
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
			setAccessToken: function(accessToken) {
				window.localStorage.setItem('access_token', accessToken);
			},
			getRefreshToken: function() {
				return window.localStorage.getItem('refresh_token');
			},
			setRefreshToken: function(refreshToken) {
				window.localStorage.setItem('refresh_token', refreshToken);
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
				});
			},
			clearUserData: function() {
				window.localStorage.removeItem('currentUser');
				window.localStorage.removeItem('access_token');
				window.localStorage.removeItem('refresh_token');
			},
			setTokensAndPullUserInfo: function(accessToken, refreshToken) {
				this.setAccessToken(accessToken);
				this.setRefreshToken(refreshToken);
				this.getSpotifyUserInfo();
			},
		}
	})
	.factory('SpotifySearchFactory', function($http) {
		return {
			search: function(track) {
				var _this = this;
				// https://developer.spotify.com/web-api/search-item/
				var req = 'https://api.spotify.com/v1/search?type=track&limit=8&q=' + encodeURIComponent(track.cleanedQuery);
				$http.get(req).success(function(response) {
					track.addSpotifyMatches(response.tracks.items);
				}).error(function(response, status, headers, config) {
					if (status === 429) {
						// If we are exceeding max requests, try this request again after a period of time
						window.setTimeout(function() {
							_this.search(track);
						}, 3000);
					}
				});
			}
		}
	})
	.factory('SpotifyPlaylistFactory', function($http, UserFactory, QueryFactory) {
		return {
			SPOTIFY_TRACK_LIMIT: 100,
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
			addTracks: function(user_id, playlist_id, access_token, arr, successCallback, errorCallback) {
				var _this = this,
					SPOTIFY_TRACK_LIMIT = _this.SPOTIFY_TRACK_LIMIT;
				// https://developer.spotify.com/web-api/add-tracks-to-playlist/
				// POST https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks
				$http.defaults.headers.common.Authorization = 'Bearer ' + access_token;

				// Spotify limits to adding 100 songs at a time
				// So we'll batch submit in 100 track subsets
				var batches = [];

				for (var i = 0; i < arr.length; i += 1) {
					var batchIndex = Math.floor((i + 1) / SPOTIFY_TRACK_LIMIT);

					if (!batches[batchIndex]) { batches[batchIndex] = []; };

					batches[batchIndex].push(arr[i]);
				}

				batches.map(function(batch) {
					_this.handleSubmitTracksToPlaylist(batch, user_id, playlist_id, successCallback, errorCallback);
				});
			},
			deleteTracks: function(user_id, playlist_id, access_token, arr, callback) {
				var _this = this;
				// DELETE https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks
				$http.defaults.headers.common.Authorization = 'Bearer ' + access_token;
				$http({
						method: 'DELETE',
						url: 'https://api.spotify.com/v1/users/' + encodeURIComponent(user_id) + '/playlists/' + encodeURIComponent(playlist_id) + '/tracks',
						data: {'tracks': arr}
					}).success(callback);
			},
			handleSubmitTracksToPlaylist: function(arr, user_id, playlist_id, successCallback, errorCallback) {
				if (!errorCallback) { errorCallback = function() { return void 0 }; }
				$http.post('https://api.spotify.com/v1/users/' + encodeURIComponent(user_id) + '/playlists/' + encodeURIComponent(playlist_id) + '/tracks?uris=' + arr.join(",")).success(successCallback).error(errorCallback);
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
							}, function(response) {
								_this.addError(messages, 'Error while adding songs to playlist on Spotify');
							});
						} else {
							_this.addError(messages, 'Error while creating playlist on Spotify');
						}
					},
					errorCallback = function(data, status, headers, config) {
						_this.handleErrorResponse(data, status, headers, config, messages, _this, function() {
							// Call the create new playlist function again
							// since we now have the proper access token
							_this.create(name, UserFactory.getUserId(), UserFactory.getAccessToken(), isPublic, successCallback, errorCallback);
						});
					};
				_this.create(name, UserFactory.getUserId(), UserFactory.getAccessToken(), isPublic, successCallback, errorCallback);
			},
			replaceTracks: function(user_id, playlist_id, access_token, trackArr, successCallback, errorCallback) {
				// https://developer.spotify.com/web-api/replace-playlists-tracks/
				// PUT https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks
				var _this = this;
				var playlist = QueryFactory.gatherPlaylist(trackArr);
				var doReplaceRequest = function(user_id, playlist_id, playlist, successCallback, errorCallback) {
					$http({
						method: 'PUT',
						url: 'https://api.spotify.com/v1/users/' + encodeURIComponent(user_id) + '/playlists/' + encodeURIComponent(playlist_id) + '/tracks',
						data: {'uris': playlist}
					}).success(successCallback).error(errorCallback);
				}

				if (playlist.length > _this.SPOTIFY_TRACK_LIMIT) {
					// First, replace all of the existing tracks
					var firstBatch = playlist.slice(0, _this.SPOTIFY_TRACK_LIMIT);
					doReplaceRequest(user_id, playlist_id, firstBatch, function() {
						// Then, add the rest and hand off the batching logic.
						_this.addTracks(user_id, playlist_id, access_token, playlist.slice(_this.SPOTIFY_TRACK_LIMIT), successCallback, errorCallback);
					}, errorCallback);
				} else {
					doReplaceRequest(user_id, playlist_id, playlist, successCallback, errorCallback);
				}
			},
			handleErrorResponse: function(data, status, headers, config, messages, _this, onReauthCallback) {
				if (status === 401) {
					// 401 unauthorized
					// The token needs to be refreshed
					UserFactory.getNewAccessToken(function(newTokenResponse) {
						UserFactory.setAccessToken(newTokenResponse.access_token);
						onReauthCallback();
					}, function(data, status, headers, config) {
						_this.addError(messages, data.error.message);
					});
				} else {
					_this.addError(messages, data.error.message);
				}
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
			},
			getPlaylistTracks: function(userId, playlistId, trackArr, messages, callback) {
				// https://developer.spotify.com/web-api/get-playlists-tracks/
				// GET https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks
				var _this = this,
					getUrl = 'https://api.spotify.com/v1/users/' + encodeURIComponent(userId) + '/playlists/' + encodeURIComponent(playlistId) + '/tracks',
					errorCallback = function(data, status, headers, config) {
						_this.handleErrorResponse(data, status, headers, config, messages, _this, function() {
							// Call the get playlist tracks again
							_this.handleGetPlaylistTracks(getUrl, UserFactory.getAccessToken(), trackArr, callback, errorCallback);
						});
					};

				_this.handleGetPlaylistTracks(getUrl, UserFactory.getAccessToken(), trackArr, callback, errorCallback);
			},
			handleGetPlaylistTracks: function(getUrl, accessToken, trackArr, successCallback, errorCallback) {
				var _this = this;
				$http.defaults.headers.common.Authorization = 'Bearer ' + accessToken;

				$http.get(getUrl).success(function(response) {
					for (var i = 0; i < response.items.length; i += 1) {
						var newTrack = new Track(response.items[i].track.name);
						// Manually put the result in the array
						newTrack.spotifyMatches.push(response.items[i].track);
						// We know that there is only 1 result from the response,
						// so we can set the selected track match to the 0th element
						newTrack.selectedMatch = 0;
						trackArr.push(newTrack);
					}
					if (response.next) {
						_this.handleGetPlaylistTracks(response.next, accessToken, trackArr, successCallback, errorCallback);
					} else {
						successCallback(trackArr);
					}
				}).error(errorCallback);
			},
			extractUserIdAndPlaylistIdFromSpotifyUri: function(uri) {
				var spotifyUriRegex = /spotify:user:(\w*):playlist:(\w*)/gi,
					regExGroups = spotifyUriRegex.exec(uri);
				if (regExGroups !== null && regExGroups.length > 1) {
					return {
						userId: regExGroups[1],
						playlistId: regExGroups[2],
					};
				}
				return null;
			},
			extractUserIdAndPlaylistIdFromSpotifyUrl: function(url) {
				var spotifyUrlRegex = /spotify.com\/user\/(.*)\/playlist\/(.*)\/?/,
					regExGroups = spotifyUrlRegex.exec(url);
				if (regExGroups !== null && regExGroups.length > 1) {
					return {
						userId: regExGroups[1],
						playlistId: regExGroups[2],
					};
				}
				return null;
			},
			extractUserIdAndPlaylistIdFromSpotifyLink: function(url) {
				return this.extractUserIdAndPlaylistIdFromSpotifyUrl(url) || this.extractUserIdAndPlaylistIdFromSpotifyUri(url);
			},
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
				var _this = this;

				trackArr.map(function(track, i) {
					// Initially batch these requests out a bit to overload the client and Spotify API
					var wait = Math.floor(i / 50) * 1000;

					return window.setTimeout(function() {
						SpotifySearchFactory.search(track);
					}.bind(_this), wait);
				});
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
						playlist.push(this.createSpotifyUriFromTrackId(currentItem.spotifyMatches[0].id));
					} else if (currentItem.spotifyMatches.length > 1 && currentItem.selectedMatch !== -1) {
						// Push the selected match of the multiple matches
						playlist.push(this.createSpotifyUriFromTrackId(currentItem.spotifyMatches[currentItem.selectedMatch].id));
					}
					// Do not push the given track if we did not find any matches on Spotify
				}
				// TODO: Do something better with the ones that we couldn't find
				return playlist;
			},
			clearResults: function(trackArr, messages) {
				// Clear the arrays, but keep the references
				trackArr.length = 0;
				messages.length = 0;
			},
		}
	})
	.factory('RedditFactory', function($http, $q, RedditUserFactory, SoundCloudFactory) {
		return {
			getSubreddit: function(subreddit, sort, t, fetchAmount, callback, errorCallback) {
				// http://www.reddit.com/r/trap/hot.json
				var req = 'https://www.reddit.com/r/' + subreddit + '/' + sort + '.json?limit=' + fetchAmount;
				if (t) {
					req += '&' + t;
				}
				console.log(req);
				$http.get(req).success(callback).error(errorCallback);
			},
			getUsersMultiReddits: function(callback) {
				var req = '/reddit/api/multi/mine/' + RedditUserFactory.getAccessToken();
				$http.get(req).success(callback);
			},
			getCommentsForThread: function(threadUrl, callback, errorCallback) {
				if (threadUrl.charAt(threadUrl.length - 1) === '/') {
					threadUrl = threadUrl + 'comments.json';
				} else {
					threadUrl = threadUrl + '/comments.json';
				}
				$http.get(threadUrl).success(function(response) {
					var comments = response[1] && response[1].data && response[1].data.children;
					var commentText = [];
					var markdownUrlRegex = /\[(.*)\]/gi;
					if (comments) {
						for (var i = 0; i < comments.length; i++) {
							var body = comments[i].data.body;
							if (body) {
								// Comments can be in literally any format anyone wants. We're going to take
								// a bit of a naive approach here and try to extract out some song titles

								var bodyLines;
								var markdownGroups;
								var sentences;
								if ((markdownGroups = markdownUrlRegex.exec(body)) !== null) {
									// First assumption: if there is a link, it's probably a link to the song
									commentText.push(markdownGroups[1]);
								} else if ((sentences = body.split('.')).length > 1) {
									// Second assumption: if there are multiple sentences, the song is the first one
									commentText.push(sentences[0]);
								} else if ((bodyLines = body.split('\n')).length > 1) {
									// Third assumption: if there are multiple lines to a comment, then the song
									// will be on the first line with a user's comments on other lines after it
									commentText.push(bodyLines[0])
								} else {
									// Fall back case
									commentText.push(comments[i].data.body);
								}
							}
						}
					}
					callback(commentText);
				}).error(errorCallback);
			},
			putAllTracksIntoArray: function(response, listings, trackArr, subredditInput, callback) {
				// 1. Take the title of each listing returned from Reddit
				var promises = listings.map(function(value) {
					var deferred = $q.defer();
					// Async task
					// 1.1. Filter out anything with a self-post
                    //      Self posts have a "domain" of self.subreddit
                    if (value.data.domain === 'self.' + subredditInput) {
                        deferred.resolve();
                        return deferred.promise;
                    }
					var newTrack = new Track(value.data.title);
					newTrack.sourceUrl = value.data.url;
					// 1.2. If the domain is soundcloud, we will add some extra info
					//      into the Track object so we can potentially show the free DL
					if (value.data.domain === 'soundcloud.com') {
						var url = '/resolve.json?url=' + value.data.url + '&client_id=' + SoundCloudFactory.apiKey;
						SC.get(url, function(scResponse) {
							if (!scResponse) {
								return deferred.resolve(response);
							}

							if (scResponse.kind === 'track' && scResponse.downloadable) {
								newTrack.downloadUrl = scResponse.download_url;
							} else if (scResponse.kind === 'playlist') {
								// TODO: Handle playlists
							}
							trackArr.push(newTrack);
							deferred.resolve(response);
						});
					} else {
						trackArr.push(newTrack);
						deferred.resolve(response);
					}
					return deferred.promise;
				});

				$q.all(promises).then(callback);
			},
		}
	})
	.factory('RedditUserFactory', function($http) {
		return {
			userLoggedIn: function() {
				return this.getAccessToken() != null && this.getAccessToken !== undefined && this.getAccessToken !== 'undefined';
			},
			getAccessToken: function() {
				return window.localStorage.getItem('reddit_access_token');
			},
			setAccessToken: function(access_token) {
				window.localStorage.setItem('reddit_access_token', access_token);
			},
			getRefreshToken: function() {
				return window.localStorage.getItem('reddit_refresh_token');
			},
			setRefreshToken: function(refresh_token) {
				window.localStorage.setItem('reddit_refresh_token', refresh_token);
			},
			clearUserData: function() {
				window.localStorage.removeItem('reddit_access_token');
				window.localStorage.removeItem('reddit_refresh_token');
			},
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
					var req = 'http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=' + encodeURIComponent(splitTrack[0].trim()) + '&track=' + encodeURIComponent(splitTrack[1].trim()) + '&api_key=' + _this.apiKey + '&limit=' + similarCount + '&format=json';
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
						extracted.push(results.track[j].artist.name + ' - ' + results.track[j].name);
					}
				}
				return extracted;
			},
			extractQueriesFromLastfmSimilarTracks: function(lastfmSimilarTracks, trackArr) {
				var _this = this;
				for (var i = 0; i < lastfmSimilarTracks.length; i += 1) {
					if (lastfmSimilarTracks[i].similartracks && lastfmSimilarTracks[i].similartracks.track instanceof Array) {
						var found = _this.extractInfoFromLastfmResults(lastfmSimilarTracks[i].similartracks);
						for (var j = 0; j < found.length; j++) {
							trackArr.push(new Track(found[j]));
						}
					}
				}
			},
			getTagTopTracks: function(tag, callback) {
				// http://www.last.fm/api/show/tag.getTopTracks
				var _this = this;

				var req = 'http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=' + tag + '&api_key=' + _this.apiKey + '&format=json';

				$http.get(req).success(callback);
			},
			getTopTracksForTimePeriod: function(username, from, to, callback) {
				// http://www.last.fm/api/show/user.getWeeklyTrackChart
				var _this = this;
				var req = 'http://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart&user=' + username + '&api_key=' + _this.apiKey + '&format=json';
				if (from) {
					req += '&from=' + from;
				}
				if (to) {
					req += '&to=' + to;
				}

				$http.get(req).success(callback);
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
	})
	.factory('SoundCloudFactory', function($http) {
		return {
			apiKey: '88434bd865d117fd3f098ca6c2c7ad38',
		}
	})
	.factory('Utilities', function() {
		return {
			shuffleArray: function(array) {
				// Fisher-Yates shuffle
				// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
				var currentIndex = array.length, temporaryValue, randomIndex;

				// While there remain elements to shuffle...
				while (0 !== currentIndex) {

					// Pick a remaining element...
					randomIndex = Math.floor(Math.random() * currentIndex);
					currentIndex -= 1;

					// And swap it with the current element.
					temporaryValue = array[currentIndex];
					array[currentIndex] = array[randomIndex];
					array[randomIndex] = temporaryValue;
				}

				return array;
			}
		}
	});
