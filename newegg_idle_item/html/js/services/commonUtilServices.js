var commonUtilServices = angular.module('commonUtilServices', []);

commonUtilServices.service('CommonUtil', [
    function(){

        return {
            getEncodePath: function(path){
                var pathParams = path.split('/');
                var encodePathParams = [];
                for (var i = 0; i < pathParams.length; i++) {
                    encodePathParams.push(encodeURIComponent(pathParams[i]))
                };
                var encodePath = encodePathParams.join('/');
                return encodePath;
            },

            getFileExtension: function(filename){
                return filename.substring(filename.lastIndexOf('.')+1).toLowerCase();
            }
        }
    }]);
