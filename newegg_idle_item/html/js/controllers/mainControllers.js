var mainControllers = angular.module('mainControllers', ['$strap.directives']);

mainControllers.controller('MainCtrl', ['$scope', function ($scope) {
	
	$scope.sellItems = new Array();
	$scope.buyItems = new Array();
	$scope.user = null;

	$scope.sellItems.push({content: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxdddddddddddddddddddddaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxdd', user: 'jd29', })
	$scope.sellItems.push({content: 'xxxxxxxxxxxxxxxxx', user: 'jd29', })
	$scope.sellItems.push({content: 'xxxxxxxxxxxxxxxxx', user: 'jd29', })
	$scope.sellItems.push({content: 'xxxxxxxxxxxxxxxxx', user: 'jd29', })
	$scope.sellItems.push({content: 'xxxxxxxxxxxxxxxxx', user: 'jd29', })
	$scope.sellItems.push({content: 'xxxxxxxxxxxxxxxxx', user: 'jd29', datetime: new Date().valueOf()})

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