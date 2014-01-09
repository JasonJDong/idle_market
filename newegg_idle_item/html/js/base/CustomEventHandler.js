var customEventHandler = angular.module('customEventHandler', []);

customEventHandler.factory('CustomEventHandler', function () {

function CustomEventHandler () {
	this.handlers = {};
}

function extend (subType) {
    CustomEventHandler.prototype = {
        constructor: subType,
        addEventHandler: function (type, handler) {
            if (typeof this.handlers[type] == 'undefined') {
                this.handlers[type] = new Array();
            }
            this.handlers[type].push(handler);
        },
        removeEventHandler: function (type, handler) {
            if (this.handlers[type] instanceof Array) {
                var handlers = this.handlers[type];
                for (var i = 0, len = handlers.length; i < len; i++) {
                    if(handlers[i] == handler){
                        handlers.splice(i, 1);
                        break;
                    }
                }
            }
        },
        triggerEventHandler: function (event) {
            if (!event.target) {
                event.target = this;
            }
            if (this.handlers[event.type] instanceof Array) {
                var handlers = this.handlers[event.type];
                for (var i = 0, len = handlers.length; i < len; i++) {
                    handlers[i](event);
                };
            }
        }
    };
	var prototype = Object(CustomEventHandler.prototype);
	prototype.constructor = subType;
	subType.prototype = prototype;
}

	return {
		extend: extend,
        callStack: function ($t) {
            CustomEventHandler.call($t);
        }
	};
});

