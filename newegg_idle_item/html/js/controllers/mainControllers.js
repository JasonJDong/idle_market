var mainControllers = angular.module('mainControllers', ['$strap.directives']);

mainControllers.controller('MainCtrl', [
	'$scope',
	'$interval',
	'ItemService',
	'UtilsService',
	 function ($scope, $interval, ItemService, UtilsService) {
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

		$scope.sellSearch = function () {
			// body...
		}

		$scope.buySearch = function () {
			// body...
		}

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

}]);