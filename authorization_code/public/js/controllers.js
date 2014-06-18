'use strict';

/* Controllers */

angular.module('listr.controllers', [])
	.controller('MyCtrl1', ['$scope', 'SpotifySearchFactory', function($scope, SpotifySearchFactory) {

		// The tracks that matched 100%
		$scope.matches = [];
		// The track that need review
		$scope.toBeReviewed = [];
		// The tracks with no matches
		$scope.noMatches = [];
		// The data in the text area
		$scope.taData = '';

		$scope.performSearch = function() {
			clearResults();
			var inputByLine = $scope.taData.split('\n');
			console.log(inputByLine);
			for (var i = 0; i < inputByLine.length; i += 1) {
				SpotifySearchFactory.search(inputByLine[i], function(response) {
					console.log(response);
					if (response.info.num_results > 1) {
						$scope.toBeReviewed.push(response);
					} else if (response.info.num_results === 1) {
						$scope.matches.push(response);
					} else {
						$scope.noMatches.push(response);
					}
				});
			}
		}

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
