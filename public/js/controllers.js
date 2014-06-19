'use strict';

/* Controllers */

angular.module('spotlistr.controllers', [])
	.controller('Textbox', ['$scope', '$routeParams', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', function($scope, $routeParams, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory) {
		if ($routeParams.access_token && $routeParams.refresh_token) {
			// Save the access token into local storage
			UserFactory.setAccessToken($routeParams.access_token);
			// Save the refresh token into local storage
			UserFactory.setRefreshToken($routeParams.refresh_token);
			UserFactory.getSpotifyUserInfo();
		}
		$scope.currentUser = UserFactory.currentUser();
		$scope.userLoggedIn = UserFactory.userLoggedIn();
		$scope.$on('userChanged', function(event, data) {
			$scope.userLoggedIn = data.userLoggedIn;
			$scope.currentUser = data.currentUser;
		});
		// The tracks that matched 100%
		$scope.matches = [];
		// The track that need review
		$scope.toBeReviewed = [];
		// The tracks with no matches
		$scope.noMatches = [];
		// The data in the text area
		$scope.taData = '';
		// The selected indexes of the review tracks
		$scope.selectedReviewedTracks = {};
		// The name of the playlist
		$scope.playlistName = '';
		// Boolean for if the playlist will be public or nah
		$scope.publicPlaylist = false;
		// Messages to the user
		$scope.messages = [];

		$scope.performSearch = function() {
			clearResults();
			var rawInputByLine = $scope.taData.split('\n');
			var inputByLine = normalizeSearchArray(rawInputByLine);
			for (var i = 0; i < inputByLine.length; i += 1) {
				SpotifySearchFactory.search(inputByLine[i], function(response) {
					if (response.tracks.items.length > 1) {
						$scope.toBeReviewed.push(response);
						$scope.selectedReviewedTracks[response.tracks.href] = response.tracks.items[0].id;
					} else if (response.tracks.items.length === 1) {
						$scope.matches.push(response);
					} else {
						$scope.noMatches.push(response);
					}
				});
			}
		};

		var normalizeSearchQuery = function(query) {
			return query.replace(/[^\w\s]/gi, '');
		};

		var normalizeSearchArray = function(arr) {
			var normalizedArray = new Array(arr.length);
			for (var i = 0; i < arr.length; i += 1) {
				normalizedArray[i] = normalizeSearchQuery(arr[i]);
			}
			return normalizedArray;
		};

		$scope.createDisplayName = function(track) {
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
		}

		var clearResults = function() {
			$scope.matches = [];
			$scope.toBeReviewed = [];
			$scope.noMatches = [];
			$scope.messages = [];
		}

		$scope.login = function() {
			UserFactory.spotifyLogin();
		}

		$scope.assignSelectedTrack = function(trackUrl, trackId) {
			$scope.selectedReviewedTracks[trackUrl] = trackId;
		}

		$scope.createPlaylist = function(name, isPublic) {
			$scope.messages = [];
			var playlist = gatherPlaylist(),
				successCallback = function(response) {
					if (response.id) {
						var playlistId = response.id;
						SpotifyPlaylistFactory.addTracks(UserFactory.getUserId(), response.id, UserFactory.getAccessToken(), playlist, function(response) {
							addSuccess('Successfully created your playlist! Check your Spotify client to view it!');
						});
					} else {
						// TODO: Handle error
						addError('Error while creating playlist on Spotify');
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
							SpotifyPlaylistFactory.create(name, UserFactory.getUserId(), UserFactory.getAccessToken(), isPublic, successCallback, errorCallback);
						}, function(data, status, headers, config) {
							addError(data.error.message);
						});
					} else {
						addError(data.error.message);
					}
				};
			SpotifyPlaylistFactory.create(name, UserFactory.getUserId(), UserFactory.getAccessToken(), isPublic, successCallback, errorCallback);
		};

		var gatherPlaylist = function () {
			var playlist = [];
			// Add all of the 100% matches
			for (var i = 0; i < $scope.matches.length; i += 1) {
				playlist.push(createSpotifyUriFromTrackId($scope.matches[i].tracks.items[0].id));
			}
			// Add the selected songs for the to-be-reviewed songs
			for (var prop in $scope.selectedReviewedTracks) {
				if ($scope.selectedReviewedTracks.hasOwnProperty(prop)) {
					playlist.push(createSpotifyUriFromTrackId($scope.selectedReviewedTracks[prop]));
				}
			}
			// TODO: Do something better with the ones that we couldn't find
			return playlist;
		};

		var createSpotifyUriFromTrackId = function(id) {
			return 'spotify:track:' + id;
		};

		var addError = function(message) {
			$scope.messages.push({
				'status': 'error',
				'message': message
			});
		};

		var addSuccess = function(message) {
			$scope.messages.push({
				'status': 'success',
				'message': message
			});
		};

	}])
	.controller('Subreddit', ['$scope', 'UserFactory', 'SpotifySearchFactory', 'RedditFactory', function($scope, UserFactory, SpotifySearchFactory, RedditFactory) {
		$scope.currentUser = UserFactory.currentUser();
		$scope.userLoggedIn = UserFactory.userLoggedIn();
		$scope.$on('userChanged', function(event, data) {
			$scope.userLoggedIn = data.userLoggedIn;
			$scope.currentUser = data.currentUser;
		});

		$scope.subredditSortBy = [{name: 'hot', id: 'hot'}, {name: 'top', id: 'top'}, {name: 'new', id: 'new'}];
		$scope.selectedSortBy = $scope.subredditSortBy[0];
		$scope.subredditInput = '';

		$scope.performSearch = function() {
			RedditFactory.getSubreddit($scope.subredditInput, $scope.selectedSortBy.id, function(response) {
				console.log(response);
			});
		};
	}])
	.controller('User', ['$scope', 'UserFactory', function($scope, UserFactory) {
		$scope.currentUser = UserFactory.currentUser();
		$scope.userLoggedIn = UserFactory.userLoggedIn();
		$scope.$on('userChanged', function(event, data) {
			$scope.userLoggedIn = data.userLoggedIn;
			$scope.currentUser = data.currentUser;
		});
	}])
	.config(['$compileProvider', function( $compileProvider ) {
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|spotify):/);
	}]);
