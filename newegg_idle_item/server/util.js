var config = require('./config');
var util = require('util');
var path = require('path');
var crypto = require('crypto');
var uuid = require('uuid');
var async = require('async');
var request = require('request');
var fs = require('fs');


var log4js = require('log4js');
log4js.configure(path.join(__dirname, 'log4js_configuration.json'), { reloadSecs: 60, cwd: __dirname });
logger = log4js.getLogger();
var errorLogger = log4js.getLogger('errors');
var infoLogger = log4js.getLogger('infos');

exports.info = function () {
    infoLogger.info(util.format.apply(this, arguments));
}

var error = exports.error = function () {
    errorLogger.error(util.format.apply(this, arguments));
}

exports.md5 = function (str, encoding) {
    return crypto
      .createHash('md5')
      .update(str)
      .digest(encoding || 'hex');
};

exports.uuid = function () {
    return uuid.v4();
};

exports.cryptoString = function (str) {
    var sha256Provider = crypto.createHash('md5');
    sha256Provider.update(str);
    return sha256Provider.digest('hex');
}
