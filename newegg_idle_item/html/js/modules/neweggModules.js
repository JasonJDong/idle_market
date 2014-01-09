'use strict';
var neweggModules = angular.module('neweggModules', []);

neweggModules.directive('ownfocus', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngShow, function (newValue) {
                if(!newValue){
                    return;
                }

                var selectIndex = scope.item.name.lastIndexOf('.');
                var length = scope.item.name.length;
                selectIndex = selectIndex !== -1 ? selectIndex : length;
                if(length < 50){
                    element[0].size = length * 0.8;
                }
                else {
                    element[0].size = 40;
                }
                $timeout(function(){
                    element[0].focus();
                    if('selectionStart' in element[0]){
                        element[0].selectionStart = 0;
                        element[0].selectionEnd = selectIndex;
                    }
                    else{
                        var inputRange = element[0].createTextRange();
                        inputRange.moveStart("character", 0);
                        inputRange.collapse ();
                        inputRange.moveEnd("character", selectIndex);
                        inputRange.select ();
                    }
                }, 100);
            });
        }
    };
}]);

neweggModules.directive("scrollFixed", function ($window) {
    return function(scope, element, attrs) {
        var adjustPosition = function(){
            if ($window.pageYOffset > 110) {
                scope.isFixedClass = true;
                scope.width = element[0].parentElement.clientWidth - 50;
            } 
            else {
                scope.isFixedClass = false;
            }
            if(!scope.$$phase) {
                scope.$apply();
            }
        }
        
        angular.element($window).bind("scroll", function() {
            // scope.$apply(adjustPosition);
            adjustPosition();
        });

        angular.element($window).bind('resize', function () {
            // scope.$apply(adjustPosition);
            adjustPosition();
        });
    };
});

neweggModules.directive('showEmptyFile', function () {
    return {
        restrict: 'EA',
        replace : true,
        transclude : true,
        scope: {
            canshow: '=canShow'
        },
        template : '<div>'
                 + '<div ng-if="canshow">'
                 + '<img ng-src="/images/file_empty.png" width="100%" height="535px" ng-transclude>'
                 + '</div></div>'
    }
});