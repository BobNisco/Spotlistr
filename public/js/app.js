'use strict';


// Declare app level module which depends on filters, and services
angular.module('listr', [
  'ngRoute',
  'listr.filters',
  'listr.services',
  'listr.directives',
  'listr.controllers'
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
  $routeProvider.otherwise({redirectTo: '/search/textbox'});
}]);
