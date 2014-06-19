'use strict';

/* Controllers */

angular.module('listr.controllers', [])
	.controller('MyCtrl1', ['$scope', '$routeParams', 'UserFactory', 'SpotifySearchFactory', function($scope, $routeParams, UserFactory, SpotifySearchFactory) {
		if ($routeParams.access_token && $routeParams.refresh_token) {
			console.log('New session being created');
			// Save the access token into local storage
			UserFactory.setAccessToken($routeParams.access_token);
			// Save the refresh token into local storage
			UserFactory.setRefreshToken($routeParams.refresh_token);
			UserFactory.getSpotifyUserInfo();
		}
		$scope.currentUser = UserFactory.currentUser();
		$scope.userLoggedIn = UserFactory.userLoggedIn();
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

		$scope.performSearch = function() {
			clearResults();
			var rawInputByLine = $scope.taData.split('\n');
			console.log(rawInputByLine);
			var inputByLine = normalizeSearchArray(rawInputByLine);
			console.log(inputByLine);
			for (var i = 0; i < inputByLine.length; i += 1) {
				SpotifySearchFactory.search(inputByLine[i], function(response) {
					console.log(response);
					if (response.tracks.items.length > 1) {
						$scope.toBeReviewed.push(response);
						$scope.selectedReviewedTracks[response.tracks.href] = response.tracks.items[0].id;
					} else if (response.tracks.items.length === 1) {
						$scope.matches.push(response);
					} else {
						$scope.noMatches.push(inputByLine[i]);
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
		}

		$scope.login = function() {
			UserFactory.spotifyLogin();
		}

		$scope.assignSelectedTrack = function(trackUrl, trackId) {
			$scope.selectedReviewedTracks[trackUrl] = trackId;
		}

	}])
	.controller('MyCtrl2', ['$scope', 'SpotifySearchFactory', 'RedditFactory', function($scope, SpotifySearchFactory, RedditFactory) {
		$scope.subredditSortBy = [{name: 'hot', id: 'hot'}, {name: 'top', id: 'top'}, {name: 'new', id: 'new'}];
		$scope.selectedSortBy = $scope.subredditSortBy[0];
		$scope.subredditInput = '';

		$scope.performSearch = function() {
			RedditFactory.getSubreddit($scope.subredditInput, $scope.selectedSortBy.id, function(response) {
				console.log(response);
			});
		};
	}])
	.config(['$compileProvider', function( $compileProvider ) {
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|spotify):/);
	}]);
