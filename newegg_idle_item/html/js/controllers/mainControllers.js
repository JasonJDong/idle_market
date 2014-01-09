var mainControllers = angular.module('mainControllers', []);

mainControllers.controller('MainCtrl', ['$scope', function ($scope) {
	
	$scope.sellItems = new Array();
	$scope.buyItems = new Array();
	$scope.user = null;


	$scope.sellSearch = function () {
		// body...
	}

	$scope.buySearch = function () {
		// body...
	}

	$scope.logout = function () {
		// body...
	}
}]);