/**
 * Module exports.
 */
module.exports = exports = Routes;

require("./util");
var Action = require("./routes/action.js");
var RouteData = require("./routes/route_data.js")

function Routes(core) {
  this.core = core;
}

Routes.prototype = {
  core: null,
  simpleRouteDB: {},
  complexRouteDB: {},

  add: function(url, method, callback) {
    if (typeof url != "string") {
      throw new IncorrectArgumentType("Routes.add: Url must be string, not " + typeof url + ".");
    }
    if (typeof method === "function") {
      throw new IncorrectArgumentType("Routes.add: add(url, callback) is decreaped. Use set, get, update, post or delete instead.");
    } else if (typeof method != "string") {
      throw new IncorrectArgumentType("Routes.add: Method must be string, not " + typeof method + ".");
    }

    var action;

    if (urlHaveParams(url)) {
      action = this.addComplex(url, method, callback);
    } else {
      this.simpleRouteDB[url] = this.simpleRouteDB[url] || {
        _action: {}
      };
      action = new Action(callback);
      this.simpleRouteDB[url]._action[method] = action;
    }

    return new RouteData(this, action);
  },

  addComplex: function(url, method, callback) {
    var segs = url.split("/");
    segs = segs.reverse();

    var hash = {
      _action: {},
    };
    var action = hash._action[method] = new Action(callback);

    var seg, next;
    for (var i = 0; i < segs.length; i++) {
      seg = segs[i];
      if (seg === "") {
        continue;
      }

      next = {};
      if (seg.indexOf(":") === 0) {
        seg = seg.replace(":", "");

        if (!next.param) {
          next.param = {};
        }
        next.param = hash;
        next.param.paramId = seg;
      } else {
        next[seg] = hash;
      }

      //Next state assign
      hash = next;
    }
    this.complexRouteDB = Object.assign(this.complexRouteDB, hash);

    return action;
  },

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

  take: function(method, url, params) {
    if (typeof url != "string") {
      throw new IncorrectArgumentType("Routes.take: Url must be string, not " + typeof url + ".");
    }

    var route = this.simpleRouteDB[url];
    if (route) {
      var action = route._action[method];
      if (action) {
        action.params = params;
        return action;
      }
    }

    return this.takeComplex(method, url, params);
  },

  takeComplex: function(method, url, params) {
    var action = null;
    params = params || {};

    //Check for the perfect route
    var segs = url.split("/");
    var seg;
    var hash = this.complexRouteDB;
    for (var i = 0, len = segs.length; i < len; i++) {
      seg = segs[i];

      if (seg === "") {
        continue;
      }

      if (seg == "_action" || seg == "paramId") {
        return route;
      }

      if (hash[seg] === undefined) {
        //Detect parameters
        if (hash.param) {
          action = hash.param._action || action;
          params[hash.param.paramId] = seg;

          hash = hash.param;
        } else {
          return action;
        }
      } else {
        hash = hash[seg];
      }
    }

    if (hash._action) {
      //return a route
      action = hash._action[method];
    }
    //return the possible params
    if (action) {
      action.params = params;
    }
    return action;
  },

  serve: function(url, request, response) {
    var action = this.take(request.method, url.pathname, url.query);

    if (action) {
      request.params = action.params;
      var data = action.execute(request, response, function(data) {
        next(response, data);
      });
      next(response, data);

      return action.haveCallbacks();
    }
    return false;
  },

  reset: function() {
    delete this.complexRouteDB;
    this.complexRouteDB = {};
    delete this.simpleRouteDB;
    this.simpleRouteDB = {};
  }
};

function next(res, data) {
  if (data == undefined) return;

  var status = data.status || 200;
  var body = data.body || JSON.stringify(data.json) || "";

  if (typeof data == "string") {
    body = data;
  }

  res.writeHead(status, {
    'Content-Length': body.length,
    'Content-Type': data.body || !data.json? 'text/plain' : 'application/json'
  });
  res.end(body);
}

function IncorrectArgumentType(message) {
  this.name = "IncorrectArgumentType";
  this.message = message || "";
}

IncorrectArgumentType.prototype = Error.prototype;

function urlHaveParams(url) {
  return url.contains("/:");
}