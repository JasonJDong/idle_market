angular.module('contentFilters', []).
filter('contentReduce', [function (UtilsService) {
  return function(content) {
    if (content.length > 20) {
      return content.substr(0, 17) + "...";
    }
    return content;
  }
}]);