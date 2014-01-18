
var EventEmitter = require('events').EventEmitter;

var emitter = new EventEmitter();

emitter.on('change', handleChanges);

var monitors = new Array();

function appendMonitor (res, mtime) {
	monitors.push({
		response: res,
		mtime: mtime
	})
}

function notifyChanges (item, changeType) {
	emitter.emit('change', item, changeType);
}

function handleChanges (item, changeType) {
	var currMonitors = monitors.splice(0, monitors.length);
	currMonitors.forEach(function (monitor) {
		if(monitor.response){
			monitor.response.send({item: item, changeType: changeType})
			monitor.response.end();
		}
	})
}

setInterval(function () {
	var currMonitors = monitors.splice(0, monitors.length);
	currMonitors.forEach(function (monitor) {
		var currentTime = new Date().valueOf();
		if (currentTime - monitor.mtime >= 60000) {
			if(monitor.response){
				monitor.response.end();
			}
		}else{
			monitors.push(monitor)
		}
	})
}, 1000)

exports.appendMonitor = appendMonitor;
exports.notifyChanges = notifyChanges;
