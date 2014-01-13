mainControllers.directive('sellScrollMore', [function () {
	return {
		restrict: 'A',
		link: function ($scope, element, attr) {
			element.bind('scroll', function () {
				if (element.scrollTop() + element.innerHeight() >= element[0].scrollHeight) {
					$scope.$emit('sellScrollMore');
				}
			})
		}
	}
}])
.directive('buyScrollMore', function () {
	return {
		restrict: 'A',
		link: function ($scope, element, attr) {
			element.bind('scroll', function () {
				if (element.scrollTop() + element.innerHeight() >= element[0].scrollHeight) {
					$scope.$emit('buyScrollMore');
				}
			})
		}
	}
})