'use strict';

/* Directives */

angular.module('listr.directives', []).
	directive('appVersion', ['version', function(version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	}])
	.directive('resultModule', function() {
		return {
			restrict: 'A',
			scope : {
				title : '@'
			},
			templateUrl : 'partials/results.html',
			transclude : true
		};
	})
	.directive('card', function () {
		return {
			restrict: 'E',
			scope: false,
			templateUrl: 'partials/card.html'
		};
	});
