'use strict';


// Declare app level module which depends on filters, and services
angular.module('spotlistr', [
  'ngRoute',
  'spotlistr.filters',
  'spotlistr.services',
  'spotlistr.directives',
  'spotlistr.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/splash', {
    templateUrl: 'partials/splash.html',
    controller: 'Splash'
  });
  $routeProvider.when('/search/textbox', {
  	templateUrl: 'partials/textbox.html',
  	controller: 'Textbox'
  });
  $routeProvider.when('/search/textbox/:access_token/:refresh_token', {
  	templateUrl: 'partials/textbox.html',
  	controller: 'Textbox'
  });
  $routeProvider.when('/search/subreddit', {
  	templateUrl: 'partials/subreddit.html',
  	controller: 'Subreddit'
  });
  $routeProvider.when('/search/lastfm-similar', {
    templateUrl: 'partials/lastfm-similar.html',
    controller: 'LastfmSimilar'
  });
  $routeProvider.when('/search/lastfm-toptracks-similar', {
    templateUrl: 'partials/lastfm-toptracks-similar.html',
    controller: 'LastfmToptracksSimilar'
  });
  $routeProvider.when('/search/youtube', {
    templateUrl: 'partials/youtube.html',
    controller: 'YouTube'
  });
  $routeProvider.when('/search/soundcloud', {
    templateUrl: 'partials/soundcloud.html',
    controller: 'SoundCloud'
  });
  $routeProvider.otherwise({redirectTo: '/splash'});
}]);
