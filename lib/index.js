/**
 * Module dependencies.
 */
var ClusterServer = require("./cluster_server"),
  HttpServer = require('./http_server'),
  Routes = require("./routes"),
  Redirection = require("./redirections"),
  Sessions = require("./session"),
  Config = require("./config");

/**
 * Module exports.
 */
module.exports = ServeMe;

/**
 * Server constructor.
 *
 * @param {Number} port
 * @param {Object} options
 * @api public
 */
function ServeMe(options, port) {
  if (!(this instanceof ServeMe))
    return ServeMe.instance = new ServeMe(options, port);

  this.config = (options instanceof Config) ? options : new Config(options);
  Sessions(this);

  if (Routes) {
    this.routes = new Routes(this);
  }
  this.Redirection = Redirection;

  this.port = port;
  var self = this;
}

ServeMe.prototype = {
  server: null,
  /**
   * Starts the server
   * @param  {Number} port [http server port]
   * @return {Object}      [server object]
   */
  start: function(port) {
    if (this.config.cluster.enabled) {
      return this.server = new ClusterServer(this, port || this.port);
    } else {
      return this.server = new HttpServer(this, port || this.port);
    }
  },

  /**
   * Resets the server
   */
  reset: ServeMe.reset = function() {
    this.stop();
    this.start(this.port);
    Sessions(this);
  },

  /**
   * Stops the server
   */
  stop: function() {
    if (this.server) {
      this.server.stop();
    }

    if (this.routes) {
      //this.routes.reset("all");
    }

    Sessions.reset();
  },

  //Routes
  routes: null,
  Redirection: null,

  get: function(url, callback) {
    this.add(url, "GET", callback);
    return this;
  },

  set: function(url, callback) {
    this.add(url, "SET", callback);
    return this;
  },

  post: function(url, callback) {
    this.add(url, "POST", callback);
    return this;
  },

  update: function(url, callback) {
    this.add(url, "UPDATE", callback);
    return this;
  },

  patch: function(url, callback) {
    this.add(url, "PATCH", callback);
    return this;
  },

  delete: function(url, callback) {
    this.add(url, "DELETE", callback);
    return this;
  },

  add: function(url, method, callback) {
    if (typeof callback == "string") {
      Redirection.add(url, method, callback);
    } else {
      this.routes.add(url, method, callback);
    }
    return this;
  },


  //Session
  Session: ServeMe.Session = Sessions,

  /**
   * On Event
   * @param  {String}   identifier [name of the event]
   * @param  {Function} callback   [method called when event is active]
   */
  on: function(identifier, callback) {
    this.events[identifier] = callback;
  },

  /**
   * Call Event
   * @param  {String} identifier [name of the event]
   */
  call: function(identifier, data) {
    var event = this.events[identifier];
    if (typeof event == "function") {
      return event(data);
    }
    return undefined;
  },

  events: {},

  impLog: function(msg) {
    console.log(msg);
  },

  log: function(msg) {
    if (this.config && this.config.log !== false)
      console.log(msg);
  }
};