'use strict';

/* Directives */

angular
  .module('spotlistr.directives', [])
  .directive('appVersion', [
    'version',
    function(version) {
      return function(scope, elm, attrs) {
        elm.text(version);
      };
    }
  ])
  .directive('resultModule', function() {
    return {
      restrict: 'AEC',
      scope: false,
      templateUrl: 'partials/results.html'
    };
  })
  .directive('adblockWarning', function() {
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'partials/adblock-warning.html'
    };
  })
  .directive('searchButton', function() {
    return {
      restrict: 'AEC',
      scope: {
        userFactory: '=userFactory',
        performSearch: '=performSearch',
        searching: '=searching',
        buttonText: '=buttonText'
      },
      templateUrl: 'partials/search-button.html'
    };
  });
