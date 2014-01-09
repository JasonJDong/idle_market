'use strict';

var loginControllers = angular.module('loginControllers', []);

loginControllers.controller('LoginCtrl', ["$scope", 'UserInfo', "$http", "$location", "$window", 
    function($scope, UserInfo, $http, $location, $window) {
      $http.defaults.useXDomain = true;
      UserInfo.currentPage = 'login';

      var checkEmailFormat = function(inputStr){
        var emailReg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
        var result = emailReg.test(inputStr);
        return result;
      }

      $scope.checkUserNameFormat = function(){
        var username = $('#username').val().toLowerCase();
        var result = checkEmailFormat(username);
        $scope.error = '';

        if(!result){
          $scope.error = 'enter your email, please';
          return;
        }
      }
        
      $scope.login = function() {
          $scope.submitting = true;
          var username = $('#username').val().toLowerCase();
          var password = $('#password').val();
          var result = checkEmailFormat(username);

          if(!result){
            $scope.error = 'enter your email, please';
            $scope.submitting = false;
            return;
          }

          if(!username || !password){
            $scope.error = 'username and password are required'; 
            $scope.submitting = false;
            return;
          }

          $scope.user.user = username;
          $scope.user.password = password;
          var userUrl = UserInfo.metaUrl + 'user';

          return $http.post(userUrl, $scope.user).success(function(data) {
              if ('token' in data) {
                $scope.submitting = false;
                var authorization = btoa(username + ":" + data['token']); 

                UserInfo.authorization = authorization;
                UserInfo.userName = username;

                var dbsValue  = btoa(username + ":" + authorization);
                if($scope.user.IsRememberMe){
                  $.cookie('neweggdbs',dbsValue,{ expires: 7 });
                }
                else{
                  $.cookie('neweggdbs',dbsValue);
                }
                return $location.path('/');
                // return $window.location.href = '#/filelist';
              } else {
                $scope.submitting = false;
                $scope.user.Password = '';
                return $scope.error = data.reason;
              }
          }).error(function(error) {
              $scope.submitting = false;
              return $scope.error = 'username or password invalid';
          });
      };

      $('body').addClass('login-layout');

      //if user is already login, redirect to filelist page.
      if(!isCookieNullOrEmpty('neweggdbs')){
        return $http({
          method: 'GET',
          url: UserInfo.metaUrl+"user", 
          headers: UserInfo.getAuthorHeader(),
          cache: true
      }).success(function(data) {
          // return $window.location.href = '#/filelist';
          return $location.path('/');
      }).error(function(reason){
          return $scope.error = "session expired. Please log in again";
      });      
    }
}]);
