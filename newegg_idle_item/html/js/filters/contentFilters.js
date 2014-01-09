angular.module('contentFilters', []).
filter('contentReduce', [function (UtilsService) {
  return function(content) {
    if (content.length > 200) {
      return content.substr(0, 200) + "...";
    }
    return content;
  }
}]);