mainControllers.directive('sellbuyPopover', [
	'$timeout',
	'ItemService',
	'UtilsService',
	function ($timeout, ItemService, UtilsService) {
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

			$scope.uploadFile = function () {
				if (!$scope.currentSelectedFile) {
					responseWork('未选择任何文件！');				
					return;
				}
				$('#fileupload').fileupload('send', {files: [$scope.currentSelectedFile]});
			}

			function responseWork (msg) {
				$scope.shouldNotifyResponse = true;
				$scope.notifyResponseMessage = msg;

				$timeout(function () {
					$scope.shouldNotifyResponse = false;
				}, 20*1000)
			}

			$scope.responseWork = responseWork;

			$scope.sellBuy = function () {
				if ($scope.request == 'sell' || $scope.request == 'sell-edit') sellNewItem();
				if ($scope.request == 'buy' || $scope.request == 'buy-edit') buyNewItem();
			}

			function upldateItem (guid, options) {
				if (guid) {
					if ($scope.request == 'sell-edit') {
						$scope.sellItems = $scope.updateItems(guid, $scope.sellItems, options);
					}else if($scope.request == 'buy-edit'){
						$scope.buyItems = $scope.updateItems(guid, $scope.buyItems, options);
					}
				}
			}

			$scope.updateItems = function  (guid, srcItems, options) {
				angular.forEach(srcItems, function (item) {
					if (item.guid === guid) {
						$.each(options, function  (key, value) {
							item[key] = value;
						});
					}
				});
				return srcItems;
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
				$scope.currentSelectedFile = null;
				$scope.currentSelectedFileName = '';
				$scope.leaveDeleteMode();
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

			$('#fileupload').fileupload({
				url: UtilsService.getBaseUrl() + '/fileupload',
				acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
				maxNumberOfFiles: 1,
				autoUpload: false,
				maxFileSize: 1024 * 1024 * 1024 * 10,
				limitMultiFileUploads: 1,
				done: function(e, data){
					if (data.result && typeof data.result === 'string') {
						data.result = angular.toJson(data.result);
					};
					var msg = data.result && data.result.success ? '上传成功！- 记得更新才能保存哦！' : '上传失败！';
					$scope.responseWork(msg);
					$scope.uploading = false;
					$scope.selectedItem.pictureUrl = data.result.pictureUrl;
					$('#fileupload').find('input:file').removeAttr('disabled');
					//upldateItem($scope.selectedItem.guid, {pictureUrl: data.result.pictureUrl})
				},
				// add: function (e, data) {
				// 	// var $this = $(this);
				// 	$('#uploadbtn').bind('click', function () {
				// 		if (!$scope.uploading) {
				// 			// if ($this[0].files.length > 0) {
				// 				// data.files = new Array();
				// 				// data.files.push($this[0].files[0]);
				// 				data.submit();
				// 			// }
				// 		}
				// 	});
				// },
				start: function (e) {
					$scope.uploading = true;
				}
			})
			.on('change', function (evt) {
				var $this = $(this);
				$scope.currentSelectedFile = $this[0].files[0];
				$scope.currentSelectedFileName = ' - ' + $this[0].files[0].name;
			});

			return element;
		}

	}
}]);