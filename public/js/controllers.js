'use strict';

/* Controllers */

angular.module('spotlistr.controllers', [])
	.controller('Textbox', ['$scope', '$routeParams', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'QueryFactory', function($scope, $routeParams, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, QueryFactory) {
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
		$scope.publicPlaylist = true;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;

		$scope.performSearch = function() {
			$scope.searching = true;
			clearResults();
			var rawInputByLine = $scope.taData.split('\n');
			var inputByLine = QueryFactory.normalizeSearchArray(rawInputByLine);
			QueryFactory.performSearch(inputByLine, $scope.matches, $scope.toBeReviewed, $scope.selectedReviewedTracks, $scope.noMatches);
			$scope.searching = false;
		};

		$scope.createDisplayName = QueryFactory.createDisplayName;

		var clearResults = function() {
			$scope.matches = [];
			$scope.toBeReviewed = [];
			$scope.selectedReviewedTracks = {};
			$scope.noMatches = [];
			$scope.messages = [];
		};

		$scope.assignSelectedTrack = function(trackUrl, trackId) {
			QueryFactory.assignSelectedTrack(trackUrl, trackId, $scope.selectedReviewedTracks);
		};

		$scope.createPlaylist = function(name, isPublic) {
			SpotifyPlaylistFactory.createPlaylist(name, isPublic, $scope.matches, $scope.selectedReviewedTracks, $scope.messages);
		};

	}])
	.controller('Subreddit', ['$scope', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'RedditFactory', 'QueryFactory', function($scope, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, RedditFactory, QueryFactory) {
		$scope.currentUser = UserFactory.currentUser();
		$scope.userLoggedIn = UserFactory.userLoggedIn();
		$scope.$on('userChanged', function(event, data) {
			$scope.userLoggedIn = data.userLoggedIn;
			$scope.currentUser = data.currentUser;
		});

		$scope.subredditSortBy = [{name: 'hot', id: 'hot'}, {name: 'top', id: 'top'}, {name: 'new', id: 'new'}];
		$scope.selectedSortBy = $scope.subredditSortBy[0];
		$scope.subredditInput = '';

		// The tracks that matched 100%
		$scope.matches = [];
		// The track that need review
		$scope.toBeReviewed = [];
		// The tracks with no matches
		$scope.noMatches = [];
		// The selected indexes of the review tracks
		$scope.selectedReviewedTracks = {};
		// The name of the playlist
		$scope.playlistName = '';
		// Boolean for if the playlist will be public or nah
		$scope.publicPlaylist = true;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;
		// How many results to fetch from Reddit (multiples of 25)
		$scope.fetchAmounts = [25, 50, 75, 100];
		// The selected fetch amount
		$scope.selectedFetchAmounts = $scope.fetchAmounts[0];

		$scope.createDisplayName = QueryFactory.createDisplayName;

		$scope.performSearch = function() {
			$scope.searching = true;
			clearResults();
			RedditFactory.getSubreddit($scope.subredditInput, $scope.selectedSortBy.id, $scope.selectedFetchAmounts, function(response) {
				var listings = response.data.children,
					trackTitles = [];

				// 1. Take the title of each listing returned from Reddit
				for (var i = 0; i < listings.length; i += 1) {
					// 1.1. Filter out anything with a self-post
					//      Self posts have a "domain" of self.subreddit
					if (listings[i].data.domain !== 'self.' + $scope.subredditInput) {
						trackTitles.push(listings[i].data.title);
					}
				}

				// 2. Search Spotify
				var inputByLine = QueryFactory.normalizeSearchArray(trackTitles);
				QueryFactory.performSearch(inputByLine, $scope.matches, $scope.toBeReviewed, $scope.selectedReviewedTracks, $scope.noMatches);
				$scope.searching = false;
			});
		};

		$scope.assignSelectedTrack = function(trackUrl, trackId) {
			QueryFactory.assignSelectedTrack(trackUrl, trackId, $scope.selectedReviewedTracks);
		};

		var clearResults = function() {
			$scope.matches = [];
			$scope.toBeReviewed = [];
			$scope.selectedReviewedTracks = {};
			$scope.noMatches = [];
			$scope.messages = [];
		};

		$scope.createPlaylist = function(name, isPublic) {
			SpotifyPlaylistFactory.createPlaylist(name, isPublic, $scope.matches, $scope.selectedReviewedTracks, $scope.messages);
		};

	}])
	.controller('LastfmSimilar', ['$scope', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'QueryFactory', 'LastfmFactory', function($scope, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, QueryFactory, LastfmFactory) {

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
		$scope.publicPlaylist = true;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;
		// Amount of similar tracks per track
		$scope.similarCount = 10;

		$scope.performSearch = function() {
			$scope.searching = true;
			clearResults();
			var inputByLine = $scope.taData.split('\n'),
				splitTrack = [];

			LastfmFactory.getSimilarTracksAndExtractInfo(inputByLine, $scope.similarCount, function(lastfmSimilarTracks) {
				console.log(lastfmSimilarTracks);
				var similar = [];
				for (var i = 0; i < lastfmSimilarTracks.length; i++) {
					console.log(lastfmSimilarTracks[i].similartracks);
					for (var j = 0; j < lastfmSimilarTracks[i].similartracks.track.length; j++) {
						similar.push(lastfmSimilarTracks[i].similartracks.track[j].artist.name + ' ' + lastfmSimilarTracks[i].similartracks.track[j].name);
					}
				}
				QueryFactory.performSearch(similar, $scope.matches, $scope.toBeReviewed, $scope.selectedReviewedTracks, $scope.noMatches);
				$scope.searching = false;
			});
		};

		$scope.createDisplayName = QueryFactory.createDisplayName;

		var clearResults = function() {
			$scope.matches = [];
			$scope.toBeReviewed = [];
			$scope.selectedReviewedTracks = {};
			$scope.noMatches = [];
			$scope.messages = [];
		};

		$scope.assignSelectedTrack = function(trackUrl, trackId) {
			QueryFactory.assignSelectedTrack(trackUrl, trackId, $scope.selectedReviewedTracks);
		};

		$scope.createPlaylist = function(name, isPublic) {
			SpotifyPlaylistFactory.createPlaylist(name, isPublic, $scope.matches, $scope.selectedReviewedTracks, $scope.messages);
		};

	}])
	.controller('User', ['$scope', 'UserFactory', function($scope, UserFactory) {
		$scope.currentUser = UserFactory.currentUser();
		$scope.userLoggedIn = UserFactory.userLoggedIn();
		$scope.$on('userChanged', function(event, data) {
			$scope.userLoggedIn = data.userLoggedIn;
			$scope.currentUser = data.currentUser;
		});

	}]);
