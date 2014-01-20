var mainControllers = angular.module('mainControllers', ['$strap.directives']);

mainControllers.controller('MainCtrl', [
	'$scope',
	'$interval',
	'ItemService',
	'UtilsService',
	'$timeout',
	 function ($scope, $interval, ItemService, UtilsService, $timeout) {
	 	var sellCount = 15;
	 	var buyCount = 15;

	 	var canFetchSell = true;
	 	var canFetchBuy = true;
	
		var originalSellItems = {items: [], fingers: []};
		var originalBuyItems = {items: [], fingers: []};

		$scope.buyItems = new Array();
		$scope.sellItems = new Array();

		$scope.buySearchTerm = ''
		$scope.sellSearchTerm = ''

		function sortCompare (aItem, bItem) {
			if (aItem.datetime > bItem.datetime) return -1;
			if (aItem.datetime < bItem.datetime) return 1;
			return 0;
		}

		function removeRepeat (items, src) {
			var tempSrc = {items: new Array().concat(src.items), fingers: new Array().concat(src.fingers)};
			angular.forEach(items, function (item) {
				var finger = item.guid;
				if (tempSrc.fingers.indexOf(finger) == -1) {
					src.items.unshift(item);
					src.fingers.unshift(finger)
				};
			});
			return src;
		}

		function queryBuyItem (count, skip, callback) {
			ItemService.queryBuyItem(count, skip, function (err, items) {
				if (items.length == 0) {
					canFetchBuy = false;
					$timeout(function () {
						canFetchBuy = true;
					}, 1000)
				};
				originalBuyItems = removeRepeat(items, originalBuyItems);
				originalBuyItems.items.sort(sortCompare)
				if (!!$scope.buySearchTerm) {
					//TODO: filter new coming items
				}else{
					$scope.buyItems = originalBuyItems.items;
				}
				if (callback) callback();
			});
		}

		function querySellItem (count, skip, callback) {
			ItemService.querySellItem(count, skip, function (err, items) {
				if (items.length == 0) {
					canFetchSell = false;
					$timeout(function () {
						canFetchSell = true;
					}, 1000)
				};
				originalSellItems = removeRepeat(items, originalSellItems);
				originalSellItems.items.sort(sortCompare)
				if (!!$scope.sellSearchTerm) {
					//TODO: filter new coming items
				}else{
					$scope.sellItems = originalSellItems.items;
				}
				if (callback) callback();
			});
		}

		(function init () {
			querySellItem(15, 0);
			queryBuyItem(15, 0);
		})()

		$scope.itemHover = function (item) {
			item.canShowEditor = true;
		}

		$scope.itemLeave = function (item) {
			item.canShowEditor = false;
		}

		$scope.editSellItem = function (item) {
			$scope.selectedItem = item;
		}

		$scope.editBuyItem = function (item) {
			$scope.selectedItem = item;
		}

		$scope.$watch('sellSearchTerm', function (newValue, oldValue) {
			$scope.userSearchSellInputing = $scope.userSearchSellInputing || true
			if (!!newValue) {
				$scope.userSearchSellInputing = true;
				var setNotInputing = $timeout(function () {
					$scope.userSearchSellInputing = false;
				},1500);
			};
		});

		$scope.$watch('userSearchSellInputing', function (newValue, oldValue) {
			if (!newValue) {
				ItemService.searchItem($scope.sellSearchTerm, 1, function (err, items) {
					$scope.sellItems = items;
					$scope.sellItems.sort(sortCompare);
				})
			}
		})

		$scope.$watch('buySearchTerm', function (newValue, oldValue) {
			$scope.userSearchBuyInputing = $scope.userSearchBuyInputing || true
			if (!!newValue) {
				$scope.userSearchBuyInputing = true;
				var setNotInputing = $timeout(function () {
					$scope.userSearchBuyInputing = false;
				},1500);
			};
		});

		$scope.$watch('userSearchBuyInputing', function (newValue, oldValue) {
			if (!newValue) {
				ItemService.searchItem($scope.buySearchTerm, 0, function (err, items) {
					$scope.buyItems = items;
					$scope.buyItems.sort(sortCompare);
				})
			}
		})

		$scope.$on('sellScrollMore', function () {
			if (canFetchSell) {
				$scope.loadingMoreSell = true;
				var skip = originalSellItems.items.length;
				querySellItem(10, skip, function  () {
					$scope.loadingMoreSell = false;
				});
			};
		});

		$scope.$on('buyScrollMore', function () {
			if (canFetchBuy) {
				$scope.loadingMoreBuy = true;
				var skip = originalBuyItems.items.length;
				queryBuyItem(10, skip, function () {
					$scope.loadingMoreBuy = false;
				});
			};
		});

		$scope.$on('itemDelete', function (evt, guid, type) {
			if (type.indexOf('sell') > -1) {
				doDeleteItem(guid, originalSellItems)
				doDeleteItem(guid, $scope.sellItems)
				checkMinItemsCount();
			}else if(type.indexOf('buy') > -1){
				doDeleteItem(guid, originalBuyItems)
				doDeleteItem(guid, $scope.buyItems)
				checkMinItemsCount();
			}
		})

		function doUpdateItem (item, src) {
			angular.forEach(src, function (_item) {
				if (_item.guid === item.guid) {
					_item = item;
					return;
				}
			});
		}

		function doDeleteItem (guid, src) {
			var find = false;
			var i = 0;
			for (; i < src.length; i++) {
				if(src[i].guid == guid){
					find = true;
					break;
				}
			}
			if (find) src.splice(i, 1);
		}

		function addItem (module) {
			$scope.addedSellItem = $scope.addedSellItem || 0;
			$scope.addedBuyItem = $scope.addedBuyItem || 0;
			var moduleType = module == 'sell' ? '售卖':'求购'; 
			switch(module){
				case 'sell':
					$scope.addedSellItem += 1;
					$scope.sellNotify = '有 ' + $scope.addedSellItem + ' 条新' + moduleType + '消息！';
					break;
				case 'buy':
					$scope.addedBuyItem += 1;
					$scope.buyNotify = '有 ' + $scope.addedSellItem + ' 条新' + moduleType + '消息！';
					break;
			}
		}

		function updateItem (item, module) {
			switch(module){
				case 'sell':
					doUpdateItem(item, $scope.sellItems);
					doUpdateItem(item, originalSellItems.items);
					break;
				case 'buy':
					doUpdateItem(item, $scope.buyItems);
					doUpdateItem(item, originalBuyItems.items);
					break;
			}
		}

		function deleteItem (guid, module) {
			switch(module){
				case 'sell':
					doDeleteItem(guid, $scope.sellItems);
					doDeleteItem(guid, originalSellItems.items);
					break;
				case 'buy':
					doDeleteItem(guid, $scope.buyItems);
					doDeleteItem(guid, originalBuyItems.items)
					break;;
			}
		}

		function immdiately () {
			ItemService.sync(immdiately, addItem, updateItem, deleteItem);
		}

		$scope.userFetchBuy = function () {
			ItemService.queryBuyItem($scope.addedBuyItem, 0, function (hasErr, items) {
				originalBuyItems = removeRepeat(items, originalBuyItems);
				items.sort(sortCompare);
				angular.forEach(items, function (item) {
					if (originalBuyItems.fingers.indexOf(item.guid) == -1) {
						$scope.buyItems.unshift(item);
					};
				})
				$scope.addedBuyItem = 0;
			});
		}

		$scope.userFetchSell = function () {
			ItemService.querySellItem($scope.addedSellItem, 0, function (hasErr, items) {
				originalSellItems = removeRepeat(items, originalSellItems);
				items.sort(sortCompare);
				angular.forEach(items, function (item) {
					if (originalSellItems.fingers.indexOf(item.guid) == -1) {
						$scope.sellItems.unshift(item);
					};
				})
				$scope.addedSellItem = 0;
			});
		}

		ItemService.sync(immdiately, addItem, updateItem, deleteItem);
}]);