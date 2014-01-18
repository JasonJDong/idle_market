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
	 	var sellPage = 0;
	 	var buyPage = 0;
	
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

		function queryBuyItem (callback) {
			ItemService.queryBuyItem(buyCount, buyPage, function (err, items) {
				originalBuyItems = removeRepeat(items, originalBuyItems);
				originalBuyItems.items.sort(sortCompare)
				if (!!$scope.buySearchTerm) {
					//TODO: filter new coming items
				}else{
					$scope.buyItems = originalBuyItems.items;
				}
				// $scope.buyItems.sort(sortCompare);
				buyPage = parseInt(originalBuyItems.items.length / buyCount);
				if (callback) callback();
			});
		}

		function querySellItem (callback) {
			ItemService.querySellItem(sellCount, sellPage, function (err, items) {
				originalSellItems = removeRepeat(items, originalSellItems);
				originalSellItems.items.sort(sortCompare)
				if (!!$scope.sellSearchTerm) {
					//TODO: filter new coming items
				}else{
					$scope.sellItems = originalSellItems.items;
				}
				// $scope.sellItems.sort(sortCompare);
				sellPage = parseInt(originalSellItems.items.length / sellCount);
				if (callback) callback();
			});
		}

		(function init () {
			querySellItem();
			queryBuyItem();
		})()

		//for less than 15 item

		function checkMinItemsCount (argument) {
			var lessSell = $interval(function () {
				if (originalSellItems.items.length < 15) {
					querySellItem();
				}else{
					$interval.cancel(lessSell);
				}
			}, 5 * 1000)

			var lessBuy = $interval(function () {
				if (originalBuyItems.items.length < 15) {
					queryBuyItem();
				}else{
					$interval.cancel(lessBuy);
				}
			}, 5 * 1000)
		}

		checkMinItemsCount();

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
			$scope.loadingMoreSell = true;
			querySellItem(function  () {
				$scope.loadingMoreSell = false;
			});
		});

		$scope.$on('buyScrollMore', function () {
			$scope.loadingMoreBuy = true;
			queryBuyItem(function () {
				$scope.loadingMoreBuy = false;
			});
		});

		$scope.$on('itemDelete', function (evt, guid, type) {
			if (type.indexOf('sell') > -1) {
				deleteLocalSellItem(guid, originalSellItems)
				deleteLocalSellItem(guid, $scope.sellItems)
				checkMinItemsCount();
			}else if(type.indexOf('buy') > -1){
				deleteLocalSellItem(guid, originalBuyItems)
				deleteLocalSellItem(guid, $scope.buyItems)
				checkMinItemsCount();
			}
		})

		function deleteLocalSellItem (guid, src) {
			var i = 0;
			var find = false;
			for (; i < src.length; i++) {
				if(src[i].guid === guid){
					find = true;
					break;
				}
			}
			if (find) {
				src.splice(i, 1);
			}
		}

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
				case 'toSell':
					doUpdateItem(item, $scope.sellItems);
					doUpdateItem(item, $scope.originalSellItems);
					break;
				case 'toBuy':
					doUpdateItem(item, $scope.buyItems);
					doUpdateItem(item, $scope.originalBuyItems);
					break;
			}
		}

		function deleteItem (guid, module) {
			switch(module){
				case 'toSell':
					doDeleteItem(guid, $scope.sellItems);
					doDeleteItem(guid, $scope.originalSellItems);
					break;
				case 'toBuy':
					doDeleteItem(guid, $scope.buyItems);
					doDeleteItem(guid, $scope.originalBuyItems)
					break;;
			}
		}

		function immdiately () {
			ItemService.sync(immdiately, addItem, updateItem, deleteItem);
		}

		$scope.userFetchBuy = function () {
			ItemService.queryBuyItem($scope.addedBuyItem, 0, function (items) {
				$scope.buyItems = removeRepeat(items, $scope.buyItems);
				$scope.originalBuyItems = removeRepeat(items, $scope.originalBuyItems);
				$scope.addedBuyItem = 0;
			});
		}

		$scope.userFetchSell = function () {
			ItemService.querySellItem($scope.addedSellItem, 0, function (items) {
				$scope.sellItems = removeRepeat(items, $scope.sellItems);
				$scope.originalSellItems = removeRepeat(items, $scope.originalSellItems);
				$scope.addedSellItem = 0;
			});
		}

		ItemService.sync(immdiately, addItem, updateItem, deleteItem);

}]);