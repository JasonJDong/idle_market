mainControllers.directive('sellbuyPopover', [
	'$timeout',
	'ItemService',
	function ($timeout, ItemService) {
	return {
		restrict: 'A',
		controller: function ($scope) {
			$scope.submitText = '确定';
			$scope.password = undefined;

			$scope.closeSelf = function () {
				$scope.dismiss();
				$scope.shouldNotifyResponse = false;
			}

			function generateTags () {
				var tags = $scope.selectedItem.tagsString.split(' ');
				if (tags.length < 5) {
					var replenish = 5 - tags.length;
					for (var i = 0; i < replenish; i++) {
						tags.push('');
					};
				}else{
					while(tags.length > 5){
						tags.pop();
					}
				}
				return tags;
			}

			function sellNewItem () {
				$scope.selectedItem.tagsString = $scope.selectedItem.tagsString || ''
				
				var item = $scope.selectedItem;
				item.pictureUrl = item.pictureUrl || '';
				item.tags = generateTags();
				item.password = $scope.password;
				ItemService.sellItem(
					item,
					function (success, respData) {
						var msg = respData.updated ? '成功!' : '失败，密码不正确？'
						if (respData && respData.guid) {
							$scope.selectedItem.guid = respData.guid;
						}
						responseWork(msg);
					}
				);
			}

			function buyNewItem () {
				$scope.selectedItem.tagsString = $scope.selectedItem.tagsString || ''
				
				var item = $scope.selectedItem;
				item.pictureUrl = item.pictureUrl || '';
				item.tags = generateTags();
				item.password = $scope.password;
				ItemService.buyItem(
					item,
					function (success, respData) {
						var msg = respData.updated ? '成功!' : '失败，密码不正确？'
						if (respData && respData.guid) {
							$scope.selectedItem.guid = respData.guid;
						}
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

			$scope.deleteMe = function () {
				var type = '';
				if ($scope.request.indexOf('sell') > -1) {
					type = 'sell';
				}else if($scope.request.indexOf('buy') > -1){
					type = 'buy';
				}
				ItemService.deleteItem($scope.selectedItem.guid, $scope.password, type, function (result) {
					var msg = result.deleted ? '成功删除!' : '删除失败!是否密码不正确？'
					if (result.deleted) {
						$scope.$emit('itemDelete', $scope.selectedItem.guid, $scope.request)
						$scope.closeSelf();
					};
					responseWork(msg);
				});
			}

			$scope.enterDeleteMode = function () {
				$scope.deleteMode = true;
			}

			$scope.leaveDeleteMode = function () {
				$scope.deleteMode = false;
			}

			$scope.$watch('selectedItem', function (newValue, oldValue) {
				if (newValue) {
					if (newValue.content && newValue.user) {
						$scope.canCreateItem = true;
					}else{
						$scope.canCreateItem = false;
					}

					if (newValue.guid) {
						$scope.submitText = '更新';
					}else{
						$scope.submitText = '添加';
					}
				}
			},true)
		},
		link: function ($scope, element, attr) {
			$scope.request = $(element[0]).parents('div[tag=popover-parent]').attr('data-request');

			if ($scope.request == 'sell' || $scope.request == 'buy') {
				$scope.selectedItem = {tags: []};
			}else{
				if ($scope.selectedItem) {
					$scope.selectedItem.tags = new Array();
					if(!!$scope.selectedItem.tag1)$scope.selectedItem.tags.push($scope.selectedItem.tag1);
					if(!!$scope.selectedItem.tag2)$scope.selectedItem.tags.push($scope.selectedItem.tag2);
					if(!!$scope.selectedItem.tag3)$scope.selectedItem.tags.push($scope.selectedItem.tag3);
					if(!!$scope.selectedItem.tag4)$scope.selectedItem.tags.push($scope.selectedItem.tag4);
					if(!!$scope.selectedItem.tag5)$scope.selectedItem.tags.push($scope.selectedItem.tag5);
					$scope.selectedItem.tagsString = $scope.selectedItem.tags.join(' ');
				}
			}
			return element;
		}

	}
}]);