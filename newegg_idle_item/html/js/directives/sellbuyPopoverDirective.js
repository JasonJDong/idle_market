mainControllers.directive('sellbuyPopover', [
	'$timeout',
	'ItemService',
	function ($timeout, ItemService) {
	return {
		restrict: 'A',
		controller: function ($scope) {


			$scope.closeSelf = function () {
				$scope.dismiss();
			}

			function sellNewItem () {
				$scope.selectedItem.tagsString = $scope.selectedItem.tagsString || ''
				var tags = $scope.selectedItem.tagsString.split('');
				var replenish = 5 - tags.length;
				for (var i = 0; i < replenish; i++) {
					tags.push('');
				};
				var item = $scope.selectedItem;
				item.pictureUrl = item.pictureUrl || '';
				item.tags = tags;
				ItemService.sellItem(
					item,
					function (success) {
					var msg = success ? '成功!' : '有错误发生!'
						responseWork(msg);
					}
				);
			}

			function buyNewItem () {
				$scope.selectedItem.tagsString = $scope.selectedItem.tagsString || ''
				var tags = $scope.selectedItem.tagsString.split('');
				var replenish = 5 - tags.length;
				for (var i = 0; i < replenish; i++) {
					tags.push('');
				};
				var item = $scope.selectedItem;
				item.pictureUrl = item.pictureUrl || '';
				item.tags = tags;
				ItemService.buyItem(
					item,
					function (success) {
					var msg = success ? '成功!' : '有错误发生!'
						responseWork(msg);
					}
				);
			}

			function responseWork (msg) {
				$scope.shouldNotifyResponse = true;
				$scope.notifyResponseMessage = msg;

				$timeout(function () {
					$scope.shouldNotifyResponse = false;
				}, 20*1000)
			}

			$scope.sellBuy = function () {
				if ($scope.request == 'sell' || $scope.request == 'sell-edit') sellNewItem();
				if ($scope.request == 'buy' || $scope.request == 'buy-edit') buyNewItem();
			}

			$scope.uploadFile = function () {
				var file = $('#fileUploader')[0].files[0];

			}

			$scope.$watch('selectedItem', function (newValue, oldValue) {
				if (newValue) {
					if (newValue.content && newValue.user) {
						$scope.canCreateItem = true;
					}else{
						$scope.canCreateItem = false;
					}
				}
			},true)
		},
		link: function ($scope, element, attr) {
			$scope.request = $(element[0]).parents('div[tag=popover-parent]').attr('data-request');

			if ($scope.request == 'sell' || $scope.request == 'buy') {
				$scope.selectedItem = {tags: []};
			}
			return element;
		}

	}
}]);