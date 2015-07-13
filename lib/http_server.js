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

module.exports = exports = HttpServer;
/******************************
 * Http Server Class
 *
 * @api public
 ******************************/
function HttpServer(main, port) {
  ServeMe = main;
  if (!port) {
    //Default port
    port = 8080;
    ServeMe.log("Need a port. Using " + port + " by default.");
  }

  var self = this;
  if (!ServeMe.config.secure) {
    this.server = http.createServer(function(request, response) {
      self.serve(self, request, response);
    });
  } else {
    if (!ServeMe.config.key) {
      throw new Error("ServerMe: Key path is empty.");
    }
    if (!ServeMe.config.cert) {
      throw new Error("ServerMe: Certificate path is empty.");
    }

    var ssl = {
      key: fs.readFileSync(ServeMe.config.key),
      cert: fs.readFileSync(ServeMe.config.cert),
    };
    this.server = https.createServer(ssl, function(request, response) {
      self.serve(self, request, response);
    });
  }

  this.server.on('error', function(e) {
    if (!ServeMe.call("error", e)) {
      throw new Error("An error ocurred in the server: " + e);
    }
  });

  this.server.listen(port, function() {
    ServeMe.impLog('ServeMe: Running at port:   ' + port);
    ServeMe.impLog('ServeMe: Secure mode(https) ' + ((ServeMe.config.secure) ? "enabled" : "disabled"));
    ServeMe.impLog('ServeMe: Debug mode         ' + ((ServeMe.config.debug) ? "enabled" : "disabled"));

    if (ServeMe.config.session.enabled) {
      ServeMe.impLog('ServeMe: Sessions           ' + ((ServeMe.config.session.enabled) ? "enabled" : "disabled"));
    }
  });
}

/******************************
 * Stop server
 * @api public
 ******************************/
HttpServer.prototype.stop = function() {
  this.server.close();
};

/******************************
 * Save files if not debugging
 ******************************/
HttpServer.prototype.files = {};

/******************************
 * Serve files or code
 * @api private
 ******************************/
HttpServer.prototype.serve = function(self, request, response) {
  ServeMe.call("http_request", {
    request: request,
    response: response
  });

  var url = urlParser.parse(request.url, true);
  var client = request.headers['X-Forwarded-For'] || request.connection.remoteAddress;

  ServeMe.log("\nServing (" + request.method + ")" + url.pathname + " to " + client);
  this.sessionBuffer = undefined;

  if (ServeMe.config.session.enabled === true) {
    this.sessionBuffer = ServeMe.Session.lookupOrCreate(url, request);
  }

  //Route detection
  if (self.serveRoute(url, request, response)) {
    ServeMe.log("  Served route.");
    return;
  }

  if (url.pathname == '/') {
    self.serveHome(self, url, request, response);

  } else if (url.pathname.endsWith("/")) {
    url.pathname += "index.html";
    self.serveFile(200, url, request, response);

  } else if (url.pathname.contains('..')) { // Avoid going out of the home dir
    self.serveError(404, url, request, response);

  } else if (url.pathname.startsWith('/src/')) {
    url.pathname = '..' + url.pathname;
    self.serveFile(200, url, request, response);

  } else {
    self.serveFile(200, url, request, response);
  }
};

/******************************
 * Serve index.html
 * @api private
 ******************************/
HttpServer.prototype.serveHome = function(self, url, request, response) {
  url.pathname = '/' + ServeMe.config.home;
  self.serveFile(200, url, request, response);
};

/******************************
 * Serve js or css
 * @api private
 ******************************/
HttpServer.prototype.serveFile = function(status, url, request, response) {
  var self = this;
  var path = ServeMe.config.directory + url.pathname;

  if (ServeMe.config.debug || this.files[path] === undefined) {
    this.readFile(path, function(err, data) {
      if (err) {
        ServeMe.log("  Couldn't serve file. 404.");
        self.serveError(404, url, request, response);
        return;
      }
      if (!ServeMe.config.debug) {
        self.files[path] = data;
      }
      ServeMe.log("  Served file from disk.");
      writeResponse(status, url, data, request, response);
    });
  } else {
    ServeMe.log("  Served file from cache.");
    writeResponse(status, url, this.files[path], request, response);
  }
};

/**
 * Will be called when an error appears
 * @api private
 */
HttpServer.prototype.serveError = function(status, url, request, response) {
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

  if (!ServeMe.config.error[status]) {
    ServeMe.log("The error page " + status + " is not defined.\nYou must set 'options.error[" + status + "]' to something!");
    return
    //throw new Error("The error page " + status + " is not defined.\nYou must set 'options.error[" + status + "]' to something!");
  }

  var self = this;
  var file = ServeMe.config.error[status];
  var path = ServeMe.config.directory + '/error/' + file;

  if (ServeMe.config.debug || this.files[path] === undefined) {
    this.readFile(path, function(err, data) {
      if (err) {
        writeResponse(500, url, "ERROR: 500 - Internal server error.", request, response, "");
        ServeMe.log(status + " error page may not exist.\n  Could not found it on: " + path);
        return;
        //throw new Error(status + " error page may not exist.\nSpecified file path: " + path + "\n");
      }

      if (!ServeMe.config.debug)
        self.files[path] = data;

      writeResponse(status, url, data, request, response, file);
    });
  } else
    writeResponse(status, url, this.files[path], request, response, file);
};

HttpServer.prototype.serveRoute = function(url, request, response) {
  if (ServeMe.routes) {
    var route = ServeMe.routes.take(request.method, url.pathname, url.query);

    if (route && route.callback) {
      var data = route.callback(route.params, request.body);

      var status = data.status || 200;
      var body = data.body || JSON.stringify(data.json) || "";

      if (typeof data == "string") {
        body = data;
      }

      response.writeHead(status, {
        'Content-Length': body.length,
        'Content-Type': 'text/plain'
      });
      response.end(body);

      return true;
    }
  }
  return false;
};

HttpServer.prototype.get_file_data = function(file, request, response) {
  var path = ServeMe.config.directory + file;
  ServeMe.log("\nServing " + file);

  if (ServeMe.config.debug || this.files[path] === undefined) {
    var self = this;
    this.readFile(path, function(err, data) {
      if (err) {
        self.serveError(404, undefined, request, response);
        ServeMe.log("  Couldn't serve file. 404.");
        return undefined;
      }
      if (!ServeMe.config.debug) {
        self.files[path] = data;
      }
      ServeMe.log("  Served file from disk.");
      return data;
    });
  } else {
    ServeMe.log("  Served file from cache.");
    return this.files[path];
  }
};

HttpServer.prototype.readFile = function(path, callback) {
  fs.readFile(path, function(err, data) {
    callback(err, data);
  });
};

/**
 * @api private
 */
function writeResponse(status, url, data, request, response, file) {
  var type = mime.get(((file) ? file : url.pathname).split(".").pop()),
    head = {
      'Content-Length': data.length,
      'Content-Type': type
    };

  response.writeHead(status, head);
  response.end(data);
}