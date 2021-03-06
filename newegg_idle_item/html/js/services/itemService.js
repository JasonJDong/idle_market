var itemService = angular.module('itemService', []);

itemService.service('ItemService', [
	'$http',
	'UtilsService',
	function ($http, UtilsService) {

	var syncServer = '';
	
	var buyItem = function (item, callback) {
		$http({
			method: 'POST',
			url: UtilsService.getBaseUrl() + '/buyitem',
			cache: false,
			data: item
		})
		.success(function (respData) {
			callback(true, respData);
		})
		.error(function () {
			callback(false, null);
		})
	}

	var sellItem = function (item, callback) {
		$http({
			method: 'POST',
			url: UtilsService.getBaseUrl() + '/sellitem',
			cache: false,
			data: item
		})
		.success(function (respData) {
			callback(true, respData);
		})
		.error(function () {
			callback(false, null);
		})
	}

	var queryBuyItem = function (count, skip, callback) {
		var uri = '/buyitem/:skip/:count'.replace(':skip', skip + '').replace(':count', count + '');

		$http({
			method: 'GET',
			url: UtilsService.getBaseUrl() + uri,
			cache: false,
			isArray: true
		})
		.success(function (items) {
			callback(false, items);
		})
		.error(function () {
			callback(true, []);
		})
	}

	var querySellItem = function (count, skip, callback) {
		var uri = '/sellitem/:skip/:count'.replace(':skip', skip + '').replace(':count', count + '');

		$http({
			method: 'GET',
			url: UtilsService.getBaseUrl() + uri,
			cache: false,
			isArray: true
		})
		.success(function (items) {
			callback(false, items);
		})
		.error(function () {
			callback(true, []);
		})
	}
	//qt: 0 - buy, 1 - sell
	var searchItem = function (term, qt, callback) {
		var paramsArray = new Array();
		var termParam = 'q=' + term;
		var qtParam = 'qt=' + qt;
		paramsArray.push(termParam, qtParam);
		var params = paramsArray.join('&');

		$http({
			method: 'GET',
			url: UtilsService.getBaseUrl() + '/search?' + params,
			cache: false,
			isArray: true
		})
		.success(function (items) {
			callback(false, items);
		})
		.error(function () {
			callback(true, []);
		})
	}

	var deleteItem = function (guid, password, type, callback) {
		var preUri = '';
		if (type.indexOf('sell') > -1) {
			preUri = '/sellitem/';
		}else if(type.indexOf('buy') > -1){
			preUri = '/buyitem/';
		}
		$http({
			method: 'DELETE',
			url: UtilsService.getBaseUrl() + preUri + btoa(guid + ":" + password),
			cache: false,
		})
		.success(function (result) {
			callback(result);
		})
		.error(function () {
			callback(null);
		})
	}

	var getSyncServer = function (callback) {
		if (!syncServer) {
			$http({
				method: 'GET',
				url: UtilsService.getBaseUrl() + '/syncServer',
			})
			.success(function (server) {
				syncServer = server;
				callback();
			})
			.error(function () {
				syncServer = '';
				callback();
			});
		}else{
			callback();
		}
	}

	var sync = function (immdiately, add, update, _delete) {
		getSyncServer(function () {
			if (syncServer) {
				$http({
					method: 'GET',
					url: syncServer + '/sync',
					cache: false,
					timeout: 60 * 2 * 1000
				})
				.success(function (result) {
					immdiately();
					if (!!result) {
						var changeType = result.changeType.split('_');
						var action = changeType.shift();
						var module = changeType.shift();
						if (action == 'add' && add) add(module);
						if (action == 'update' && update) update(result.item, module);
						if (action == 'delete' && _delete) _delete(result.item, module);
					}
				})
				.error(function () {
					immdiately();
				})
			}
		});
	}

	return {
		buyItem: buyItem,
		sellItem: sellItem,
		queryBuyItem: queryBuyItem,
		querySellItem: querySellItem,
		searchItem: searchItem,
		deleteItem: deleteItem,
		sync: sync
	}
}])