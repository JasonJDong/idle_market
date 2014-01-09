'use strict';

// Declare app level module which depends on filters, and services
var idleApp = angular.module('idleApp', [
  'ngRoute',
  'ngCookies',
  'utilsService',
  'commonUtilServices',
  'customEventHandler',
  'loginControllers',
  'beforeLoginControllers',
  'timeoutInfoModule',
  'ui.bootstrap',
  'neweggModules',
  'contentFilters',
  ''
]);

idleApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home.html', {
  		templateUrl: 'views/main.html', 
  		controller: 'MainCtrl'});

  $routeProvider.when('/mine', {
    templateUrl: 'views/mine.html', 
    controller: 'MineCtrl'});

  $routeProvider.when('/error/404.html', {
      templateUrl: 'views/error/404.html'});

  $routeProvider.when('/error/500.html', {
      templateUrl: 'views/error/500.html'});

  $routeProvider.otherwise({redirectTo: '/'});
}]);

idleApp.config(function($httpProvider){
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  });
