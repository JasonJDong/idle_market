var express = require('express');
var agent = require('agentkeepalive');
var config = require('./sync-config');
var monitorManager = require('./monitor_manager');

var util = require('util')
var utils = require('./util')

var app = express();
var DEFAULT_PORT = config.listenPort || 9001;

var keepaliveAgent = new agent({
    maxSockets: 2048,
    maxKeepAliveRequests: 0, // max requests per keepalive socket, default is 0, no limit.
    maxKeepAliveTime: 30000 // keepalive for 30 seconds
});
require('http').globalAgent = keepaliveAgent;

app.configure(function () {
    if (config.expressloglevel == 'dev') app.use(express.logger(config.expressloglevel));
    app.use(express.bodyParser());
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.get('/sync', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'POST,GET,PUT,DELETE,OPTIONS')
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization')
	monitorManager.appendMonitor(res, new Date().valueOf());
});

app.post('/notify', function (req, res) {
	var data = req.body.data;
	var changeType = req.body.changeType;
	monitorManager.notifyChanges(data, changeType)
	res.end();
})

exports.start = function () {
    app.listen(DEFAULT_PORT);
    util.puts('Sync Server running at [this PC IP]:' + DEFAULT_PORT + '/');
}
