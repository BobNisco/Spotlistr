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
  $routeProvider.otherwise({redirectTo: '/search/textbox'});
}]);
