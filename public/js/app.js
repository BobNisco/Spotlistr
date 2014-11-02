'use strict';


// Declare app level module which depends on filters, and services
angular.module('spotlistr', [
  'ngRoute',
  'spotlistr.filters',
  'spotlistr.services',
  'spotlistr.directives',
  'spotlistr.controllers',
  'angulartics',
  'angulartics.google.analytics'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/splash/', {
    templateUrl: 'dist/partials/splash.html',
    controller: 'Splash'
  });
  $routeProvider.when('/splash/:accessToken/:refreshToken', {
    templateUrl: 'dist/partials/splash.html',
    controller: 'Splash'
  });
  $routeProvider.when('/search/textbox', {
  	templateUrl: 'dist/partials/textbox.html',
  	controller: 'Textbox'
  });
  $routeProvider.when('/search/textbox/:accessToken/:refreshToken', {
  	templateUrl: 'dist/partials/textbox.html',
  	controller: 'Textbox'
  });
  $routeProvider.when('/search/subreddit', {
  	templateUrl: 'dist/partials/subreddit.html',
  	controller: 'Subreddit'
  });
  $routeProvider.when('/search/multireddit', {
    templateUrl: 'dist/partials/multireddit.html',
    controller: 'Multireddit'
  });
  $routeProvider.when('/search/multireddit/:access_token/:refresh_token', {
    templateUrl: 'dist/partials/multireddit.html',
    controller: 'Multireddit'
  });
  $routeProvider.when('/search/lastfm-similar', {
    templateUrl: 'dist/partials/lastfm-similar.html',
    controller: 'LastfmSimilar'
  });
  $routeProvider.when('/search/lastfm-toptracks-similar', {
    templateUrl: 'dist/partials/lastfm-toptracks-similar.html',
    controller: 'LastfmToptracksSimilar'
  });
  $routeProvider.when('/search/youtube', {
    templateUrl: 'dist/partials/youtube.html',
    controller: 'YouTube'
  });
  $routeProvider.when('/search/soundcloud', {
    templateUrl: 'dist/partials/soundcloud.html',
    controller: 'SoundCloud'
  });
  $routeProvider.when('/users/log-out', {
    templateUrl: 'dist/partials/splash.html',
    controller: 'UsersLogOut'
  });
  $routeProvider.when('/export/spotify-playlist', {
    templateUrl: 'dist/partials/export-spotify-playlist.html',
    controller: 'ExportSpotifyPlaylist'
  });
  $routeProvider.when('/manage/dedupe-playlist', {
    templateUrl: 'dist/partials/dedupe-playlist.html',
    controller: 'DedupePlaylist'
  });
  $routeProvider.otherwise({redirectTo: '/splash'});
}]);
