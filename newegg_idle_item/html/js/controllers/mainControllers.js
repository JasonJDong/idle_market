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
	
		var originalSellItems = new Array();
		var originalBuyItems = new Array();

		$scope.buyItems = new Array();
		$scope.sellItems = new Array();

		$scope.buySearchTerm = ''
		$scope.sellSearchTerm = ''

		function sortCompare (aItem, bItem) {
			if (aItem.datetime > bItem) return 1;
			if (aItem.datetime < bItem) return -1;
			return 0;
		}

		function removeRepeat (items, srcSet) {
			var tmpSrcSet = new Array();
			tmpSrcSet.concat(srcSet);
			angular.forEach(items, function (item) {
				if (tmpSrcSet.indexOf(item) == -1) {
					srcSet.unshift(item);
				};
			});
			return srcSet;
		}

		function queryBuyItem () {
			ItemService.queryBuyItem(buyCount, buyPage, function (err, items) {
				// angular.forEach(items, function (item) {
				// 	// var itemFinger = JSON.stringify(item);
				// 	if (originalBuyItems.itemFingers.indexOf()) {};
				// })
				originalBuyItems = removeRepeat(items, originalBuyItems);
				if (!!$scope.buySearchTerm) {
					//TODO: filter new coming items
				}else{
					$scope.buyItems = originalBuyItems;
				}
				$scope.buyItems.sort(sortCompare);
				buyPage = parseInt(originalBuyItems / buyCount);
			});
		}

		function querySellItem () {
			ItemService.querySellItem(sellCount, sellPage, function (err, items) {
				originalSellItems = removeRepeat(items, originalSellItems);
				if (!!$scope.sellSearchTerm) {
					//TODO: filter new coming items
				}else{
					$scope.sellItems = originalSellItems;
				}
				$scope.sellItems.sort(sortCompare);
				sellPage = parseInt(originalSellItems / sellCount);
			});
		}

		(function init () {
			querySellItem();
			queryBuyItem();
		})()

		//for less than 15 item
		var lessSell = $interval(function () {
			if (originalSellItems.length < 15) {
				querySellItem();
			}else{
				$interval.cancel(lessSell);
			}
		}, 5 * 1000)

		var lessBuy = $interval(function () {
			if (originalBuyItems.length < 15) {
				queryBuyItem();
			}else{
				$interval.cancel(lessBuy);
			}
		}, 5 * 1000)


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
			$scope.selectedItem.tagsString = $scope.selectedItem.tags.join(' ')
		}

		$scope.editBuyItem = function (item) {
			$scope.selectedItem = item;
			$scope.selectedItem.tagsString = $scope.selectedItem.tags.join(' ')
		}

		$scope.$on('sellScrollMore', function (argument) {
			querySellItem();
		});

		$scope.$on('buyScrollMore', function (argument) {
			queryBuyItem();
		});

}]);