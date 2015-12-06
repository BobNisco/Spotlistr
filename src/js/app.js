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
    templateUrl: 'partials/splash.html',
    controller: 'Splash'
  });
  $routeProvider.when('/splash/:accessToken/:refreshToken', {
    templateUrl: 'partials/splash.html',
    controller: 'Splash'
  });
  $routeProvider.when('/search/textbox', {
  	templateUrl: 'partials/textbox.html',
  	controller: 'Textbox'
  });
  $routeProvider.when('/search/textbox/:accessToken/:refreshToken', {
  	templateUrl: 'partials/textbox.html',
  	controller: 'Textbox'
  });
  $routeProvider.when('/search/subreddit', {
  	templateUrl: 'partials/subreddit.html',
  	controller: 'Subreddit'
  });
  $routeProvider.when('/search/multireddit', {
    templateUrl: 'partials/multireddit.html',
    controller: 'Multireddit'
  });
  $routeProvider.when('/search/multireddit/:access_token/:refresh_token', {
    templateUrl: 'partials/multireddit.html',
    controller: 'Multireddit'
  });
  $routeProvider.when('/search/reddit-comments', {
    templateUrl: 'partials/reddit-comments.html',
    controller: 'RedditComments'
  });
  $routeProvider.when('/search/lastfm-similar', {
    templateUrl: 'partials/lastfm-similar.html',
    controller: 'LastfmSimilar'
  });
  $routeProvider.when('/search/lastfm-toptracks-similar', {
    templateUrl: 'partials/lastfm-toptracks-similar.html',
    controller: 'LastfmToptracksSimilar'
  });
  $routeProvider.when('/search/lastfm-tag-top-tracks', {
    templateUrl: 'partials/lastfm-tag-top-tracks.html',
    controller: 'LastfmTagTopTracks'
  });
  $routeProvider.when('/search/youtube', {
    templateUrl: 'partials/youtube.html',
    controller: 'YouTube'
  });
  $routeProvider.when('/search/soundcloud', {
    templateUrl: 'partials/soundcloud.html',
    controller: 'SoundCloud'
  });
  $routeProvider.when('/users/log-out', {
    templateUrl: 'partials/splash.html',
    controller: 'UsersLogOut'
  });
  $routeProvider.when('/export/spotify-playlist', {
    templateUrl: 'partials/export-spotify-playlist.html',
    controller: 'ExportSpotifyPlaylist'
  });
  $routeProvider.when('/manage/dedupe-playlist', {
    templateUrl: 'partials/dedupe-playlist.html',
    controller: 'DedupePlaylist'
  });
  $routeProvider.otherwise({redirectTo: '/splash'});
}]);
