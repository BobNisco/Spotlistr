'use strict';

/* Services */
angular.module('listr.services', [])
	.value('version', '0.1')
	.factory('UserFactory', function($http) {
		return {
			currentUser: function() {
				return JSON.parse(window.localStorage.getItem('currentUser'));
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
			getSpotifyUserInfo: function() {
				$http.defaults.headers.common.Authorization = 'Bearer ' + this.getAccessToken();
				$http.get('https://api.spotify.com/v1/me').success(function(response) {
					window.localStorage.setItem('currentUser', JSON.stringify(response));
				});
			}
		}
	})
	.factory('SpotifySearchFactory', function($http) {
		return {
			search: function(query, callback) {
				// https://developer.spotify.com/web-api/search-item/
				var req = 'https://api.spotify.com/v1/search?type=track&q=' + encodeURIComponent(query);
				$http.get(req).success(callback);
			}
		}
	})
	.factory('RedditFactory', function($http) {
		return {
			getSubreddit: function(subreddit, sort, callback) {
				// http://www.reddit.com/r/trap/hot.json
				var req = 'http://www.reddit.com/r/' + subreddit + '/' + sort + '.json';
				console.log(req);
				$http.get(req).success(callback);
			}
		}
	});
