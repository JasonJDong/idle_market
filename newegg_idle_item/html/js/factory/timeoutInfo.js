var timeoutInfoModule = angular.module('timeoutInfoModule', []);

timeoutInfoModule.factory('TimeoutInfo', ['$timeout', function ($timeout) {

    return {
        info_old: function(infoModel, timeoutMillionSec){
            if(!timeoutMillionSec){
                return;
            }
            $timeout(function(){
                infoModel.info = '';
            }, timeoutMillionSec);
        },

        info: function(message, isSuccess, timeoutMillionSec, callback){
            var info = {
                message: message,
                success: isSuccess
            }

            if(!timeoutMillionSec){
                callback(info);
                return;
            }
            callback(info);
            $timeout(function(){
                callback();
            }, timeoutMillionSec);
        }

    }
}]);