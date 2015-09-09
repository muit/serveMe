'use strict';

/******************************
 * ServeMe
 * Simple Web Server.
 ******************************/


/******************************
 * Redirections Class
 *
 * @api public
 ******************************/
var Redirection = {
  get: function(url, method) {
    if (!url) return null;
    return this.all[method+"<#?>"+url];
  },

  add: function(url, method, redirectionUrl) {
    if (!url) return;
    this.all[method+"<#?>"+url] = redirectionUrl;
  },

  contains: function(url, method) {
    return !!this.all[method+"<#?>"+url];
  },

  all: {},
};

module.exports = exports = Redirection;