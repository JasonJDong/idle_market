'use strict';

var beforeLoginControllers = angular.module('beforeLoginControllers', []);

beforeLoginControllers.controller('BeforeLoginCtrl', ['$scope', 
	'$rootScope', 
	'$http', 
	'$window',
	'$cookies',
	'UserInfo',
	'$routeParams',
	function($scope, $rootScope, $http, $window, $cookies, UserInfo, $routeParams){

	    // if(!isCookieNullOrEmpty('neweggdbs')){
	    //     return $http({
	    //       method: 'GET',
	    //       url: UserInfo.rootUrl+"user", 
	    //       headers: UserInfo.getAuthorHeader(),
	    //       cache: true,
	    //   }).success(function(data) {
	    //       return $window.location.href = '#/filelist';
	    //   });      
	    // }

		var tokenBase64 = $routeParams.token;
		var userObj = {
			user: atob(tokenBase64).split(':')[0],
			password: atob(tokenBase64).split(':')[1]
		}

		var userUrl = UserInfo.rootUrl + 'user';
		var username = userObj.user;
		$http.post(userUrl, userObj).success(function(data) {
			if ('token' in data) {
				var authorization = btoa(username + ":" + data['token']); 

				UserInfo.authorization = authorization;
				UserInfo.userName = username;

				var dbsValue  = btoa(username + ":" + authorization);
				$.cookie('neweggdbs',dbsValue);
				return $window.location.href = '#/filelist';
			}
			else {
				$window.location.href = '#/login';
			}
			}).error(function(error) {
				$window.location.href = '#/login';
			});

}]);