/**
 * Module exports.
 */
module.exports = exports = Action;

function Action(callback) {
	this.callbacks = [callback];
}

Action.prototype = {
	require: null,
	callbacks: [],

	execute: function(req, res, next) {
		if (this.require && this.require(req, res, next) == false) {
			console.log("Not passed require");
			return;
		}

		var len = this.callbacks.length;
		if (len == 0) {
			return;
		} else if (len == 1) {
			return this.callbacks[0](req, res, next);
		}

		/* Not yet implemented multiple routes
		for(var i = 0, len = callbacks.length; i < len; i++) {
			callbacks[i](req, res, next);
		}
		*/
	},

	addRequire: function(callback) {
		require = callback;
	}
}