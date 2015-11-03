"use strict";

/**
 * Module exports.
 */
module.exports = exports = Action;

function Action(cb) {
	if(!cb) return;
	this.callbacks = (cb instanceof Array)? cb : [cb];
}

Action.prototype = {
	require: null,
	callbacks: [],
	fails: [],

	execute: function(req, res, next) {
		if (this.require && this.require(req, res, next) == false) {

			var len = this.fails.length;

			if (len == 1) {
				return this.fails[0](req, res, next);
			}

			/* Not yet implemented multiple fails
			for(var i = 0; i < len; i++) {
				this.fails[i](req, res, next);
			}
			*/
			return;
		}

		var len = this.callbacks.length;

		if (len == 1) {
			return this.callbacks[0](req, res, next);
		}

		/* Not yet implemented multiple routes
		for(var i = 0; i < len; i++) {
			this.callbacks[i](req, res, next);
		}
		*/
		return;
	},

	addCallback: function(callback) {
		if (callback)
			this.callbacks.push(callback);
	},

	addRequire: function(check, fail) {
		this.require = check;
		if(!fail) return;
		
		this.fails = (fail instanceof Array)? fail : [fail];
	},

	haveCallbacks: function() {
		return this.callbacks.length > 0;
	}
}