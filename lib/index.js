/**
 * Module dependencies.
 */
var ClusterServer = require("./cluster_server"),
  HttpServer = require('./http_server'),
  Routes = require("./routes"),
  Redirection = require("./redirections"),
  Sessions = require("./session"),
  Config = require("./config"),
  Package = require('../package.json');

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

  this.version = Package.version;
}

ServeMe.prototype = {
  server: null,
  /**
   * Starts the server
   * @param  {Number} port [http server port]
   * @return {Object}      [server object]
   */
  start: function(port, onStarted) {
    //If port is the callback
    if(typeof port == "function") {
      onStarted = port;
      port = null;
    }

    if (this.config.cluster.enabled) {
      return this.server = new ClusterServer(this, port || this.port, onStarted);
    } else {
      return this.server = new HttpServer(this, port || this.port, onStarted);
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
      Redirection.add(url, method, callback);
      return this;
    } else {
      return this.routes.add(url, method, callback);
    }
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

  impLog: function(msg, enter) {
    if(msg.replace(" ", "").length > 0)
      msg = ">> "+msg;
    if(enter)
      msg = "\n"+msg;

    console.log(msg);
  },

  log: function(msg, enter) {
    if (this.config && this.config.log !== false)
      this.impLog(msg, enter);
  }
};