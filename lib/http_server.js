'use strict';

/******************************
 * ServeMe
 * Simple Web Server.
 ******************************/

var urlParser = require('url');
var fs = require('fs');
var mime = require("./mime.js");
var http = require('http');
var https = require('https');
if (typeof Utyl == "undefined") require("./utyl/utyl.js");

var ServeMe;
var config;

module.exports = exports = HttpServer;
/******************************
 * Http Server Class
 *
 * @api public
 ******************************/
function HttpServer(main, port, onStarted) {
  ServeMe = main;
  config = ServeMe.config;

  var self = this;

  if (!port) {
    //Default port
    port = 8080;
    ServeMe.log("Need a port. Using " + port + " by default.");
  }

  if (!config.secure) {
    this.server = http.createServer(function(request, response) {
      self.serve(self, request, response);
    });
  } else {
    if (!config.key) {
      throw new Error("ServeMe: SSH Key path is missing.");
    }
    if (!config.cert) {
      throw new Error("ServeMe: SSH Certificate path is missing.");
    }

    var ssl = {
      key: fs.readFileSync(config.key),
      cert: fs.readFileSync(config.cert),
    };
    this.server = https.createServer(ssl, function(request, response) {
      self.serve(self, request, response);
    });
  }

  this.server.listen(port, config.hostname, function() {
    ServeMe.impLog('ServeMe v' + ServeMe.version + "\n----------");
    ServeMe.impLog('Listening at port:   ' + port);
    ServeMe.impLog('Secure mode(https) ' + (config.secure ? "enabled" : "disabled"));
    ServeMe.impLog('Debug mode         ' + (config.debug ? "enabled" : "disabled"));

    if (config.session.enabled) {
      ServeMe.impLog('Sessions           ' + config.session.enabled ? "enabled" : "disabled");
    }

    //Start Events
    if (typeof onStarted == "function") {
      onStarted();
    }
    ServeMe.call("listening");
  });

  this.server.on('error', function(e) {
    if (!ServeMe.call("error", e)) {
      throw new Error("An error ocurred in the server: " + e);
    }
  });
}


HttpServer.prototype = {
  /******************************
   * Cache Storage
   ******************************/
  cache: {},

  /******************************
   * Serve files or code
   * @api private
   ******************************/
  serve: function(self, request, response) {
    ServeMe.call("http_request", {
      request: request,
      response: response
    });

    var url = urlParser.parse(request.url, true);
    var client = request.headers['X-Forwarded-For'] || request.connection.remoteAddress;

    ServeMe.log("Serving (" + request.method + ")" + url.pathname + " to " + client, true);
    this.sessionBuffer = undefined;

    if (config.session.enabled === true) {
      this.sessionBuffer = ServeMe.Session.lookupOrCreate(url, request);
    }

    //Route detection
    if (self.serveRoute(url, request, response)) {
      ServeMe.log("  Served route.");
      return;
    }

    if (url.pathname.endsWith("/")) {
      //Serve a direction
      url.pathname += "index.html";
      self.serveFile(200, url, request, response);
    } else if (url.pathname.contains('..')) {
      //Restrict path
      self.serveError(404, url, request, response);
    } else {
      self.serveFile(200, url, request, response);
    }
  },

  /******************************
   * Serve index.html
   * @api private
   ******************************/
  serveHome: function(self, url, request, response) {
    url.pathname = '/' + config.home;
    self.serveFile(200, url, request, response);
  },

  /******************************
   * Serve js or css
   * @api private
   ******************************/
  serveFile: function(status, url, request, response) {
    var self = this;
    var path = config.directory + url.pathname;

    if (config.debug || this.cache[path] === undefined) {
      this.readFile(path, function(err, data) {
        if (err) {
          ServeMe.log("  Couldn't serve file. 404.");
          self.serveError(404, url, request, response);
          return;
        }
        if (!config.debug) {
          self.cache[path] = data;
        }
        ServeMe.log("  Served file from disk.");
        writeResponse(status, url, data, request, response);
      });
    } else {
      ServeMe.log("  Served file from cache.");
      writeResponse(status, url, this.cache[path], request, response);
    }
  },

  /**
   * Will be called when an error appears
   * @api private
   */
  serveError: function(status, url, request, response) {
    if (this.sessionBuffer && this.sessionBuffer.session && this.sessionBuffer.data) {
      response.writeHead(200, {
        'Content-Length': this.sessionBuffer.data.length,
        'Content-Type': "text/plain",
        'Set-Cookie': this.sessionBuffer.session.getSetCookieHeaderValue()
      });
      response.end(this.sessionBuffer.data);
      ServeMe.log("  Served Session response.");
      return;
    }

    if (!config.error[status]) {
      ServeMe.log("The error page " + status + " is not defined.\nYou must set 'options.error[" + status + "]' to something!");
      return
      //throw new Error("The error page " + status + " is not defined.\nYou must set 'options.error[" + status + "]' to something!");
    }

    var self = this;
    var file = config.error[status];
    var path = config.directory + '/error/' + file;

    if (config.debug || this.cache[path] === undefined) {
      this.readFile(path, function(err, data) {
        if (err) {
          writeResponse(500, url, "ERROR: 500 - Internal server error.", request, response, "");
          ServeMe.log(status + " error page may not exist.\n  Could not found it on: " + path);
          return;
          //throw new Error(status + " error page may not exist.\nSpecified file path: " + path + "\n");
        }

        if (!config.debug)
          self.cache[path] = data;

        writeResponse(status, url, data, request, response, file);
      });
    } else
      writeResponse(status, url, this.cache[path], request, response, file);
  },

  serveRoute: function(url, request, response) {
    var redirectionUrl = ServeMe.Redirection.get(url.pathname, request.method);
    if (redirectionUrl) {
      url.pathname = redirectionUrl;
      this.serveFile(200, url, request, response);

    } else if (ServeMe.routes) {
      //Avoid route crash
      try {
        return ServeMe.routes.serve(url, request, response);
      } catch (e) {
        console.log(e.stack);
        return true;
      }
    }
    return false;
  },

  getFileData: function(file, request, response) {
    var path = config.directory + file;
    ServeMe.log("\nServing " + file);

    if (config.debug || this.cache[path] === undefined) {
      var self = this;
      this.readFile(path, function(err, data) {
        if (err) {
          self.serveError(404, undefined, request, response);
          ServeMe.log("  Couldn't serve file. 404.");
          return undefined;
        }
        if (!config.debug) {
          self.cache[path] = data;
        }
        ServeMe.log("  Served file from disk.");
        return data;
      });
    } else {
      ServeMe.log("  Served file from cache.");
      return this.cache[path];
    }
  },

  readFile: function(path, callback) {
    fs.readFile(path, callback);
  },

  /******************************
   * Stop server
   * @api public
   ******************************/
  stop: function() {
    this.server.close();
  }
}

/**
 * @api private
 */
function writeResponse(status, url, data, request, response, file) {
  var type = mime.get((file ? file : url.pathname).split(".").pop()),
    head = {
      'Content-Length': data.length,
      'Content-Type': type
    };

  response.writeHead(status, head);
  response.end(data);
}