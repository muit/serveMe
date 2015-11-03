"use strict";

/**
 * Module exports.
 */
module.exports = exports = RouteData;

function RouteData(routes, action) {
  this.routes = routes;
  this.action = action;
}

RouteData.prototype = {
  routes: null,
  action: null,

  require: function(check, fail) {
    this.action.addRequire(check, fail);
  },


  //Direct handlers to create new routes
  get: function(url, callback) {
    return this.add(url, "GET", callback);
  },

  set: function(url, callback) {
    return this.add(url, "SET", callback);
  },

  post: function(url, callback) {
    return this.add(url, "POST", callback);
  },

  update: function(url, callback) {
    return this.add(url, "UPDATE", callback);
  },

  patch: function(url, callback) {
    return this.add(url, "PATCH", callback);
  },

  delete: function(url, callback) {
    return this.add(url, "DELETE", callback);
  },

  add: function(url, method, callback) {
    if (typeof callback == "string") {
      //Temporal disable redirections here
      //Redirection.add(url, method, callback);
      return this.routes;
    } else {
      return this.routes.add(url, method, callback);
    }
  },

};