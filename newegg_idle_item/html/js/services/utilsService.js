var utilsService = angular.module('utilsService', []);

utilsService.service('UtilsService', ['$location', '$window', function ($location, $window) {

	function getEncodePath(path) {
        var pathParams = path.split('/');
        var encodePathParams = [];
        for (var i = 0; i < pathParams.length; i++) {
            encodePathParams.push(encodeURIComponent(pathParams[i]))
        };
        var encodePath = encodePathParams.join('/');
        return encodePath;
     }

     function theDayAfterDays (days) {
     	var today = new Date().valueOf();
     	var assignDay = days * 1000 * 60 * 60 * 24;
     	return new Date(today + assignDay);
     }

     function getBaseUrl () {
     	return $location.protocol() + '://' + $location.host() + ':' + ($location.port() || 8080);
     }

     function getCurrentUrl () {
         return $window.location.href;
     }

     function getCurrentHash () {
         return $location.path();
     }

     return {
     	getEncodePath: getEncodePath,
     	theDayAfterDays: theDayAfterDays,
     	getBaseUrl: getBaseUrl,
        getCurrentUrl: getCurrentUrl,
        getCurrentHash: getCurrentHash
     }
}]);