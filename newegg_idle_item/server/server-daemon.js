require("mkdirp").sync('logs');

var util = require('util');
var neweggUtil = require('./util')
var path = require('path');
var cluster = require('cluster');
var webServer = require('./web-server');
var os = require('os');
var sqliteClass = require('./sqliteutil').Sqlite;

var numCPUs = os.cpus().length;

process.on("uncaughtException", function (err) {
    neweggUtil.error("web server uncaughtException : ", err.message, "\n type:", err.type, "\n arguments:", typeof (err.arguments), "\n stack: ", err.stack, err);
    process.exit();
});

if (cluster.isMaster) {

	sqlite = new sqliteClass();
	sqlite.init();

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker) {
        cluster.fork();
    });

} else {
	webServer.start();
}