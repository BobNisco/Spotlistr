'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('listr.services', [])
	.value('version', '0.1')
	.factory('SpotifySearchFactory', function($http) {
		return {
			search: function(query, callback) {
				//https://ws.spotify.com/search/1/track.json?q=kaizers+orchestra
				var req = 'https://ws.spotify.com/search/1/track.json?q=' + encodeURIComponent(query);
				console.log(req);
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
