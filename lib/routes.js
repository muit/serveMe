/**
 * Module exports.
 */
module.exports = exports = Routes;

require("./util");

function Routes(core) {
  this.core = core;
}

Routes.prototype = {
  core: null,
  routeDB: {},

  add: function(url, method, callback) {
    if (typeof url != "string") {
      throw new IncorrectArgumentType("Routes.add: Url must be string, not " + typeof url + ".");
    }
    if (typeof method === "function") {
      throw new IncorrectArgumentType("Routes.add: add(url, callback) is decreaped. Use set, get, update, post or delete instead.");
    } else if (typeof method != "string") {
      throw new IncorrectArgumentType("Routes.add: Method must be string, not " + typeof method + ".");
    }

    var segs = url.split("/");
    segs = segs.reverse();

    var hash = {
      _data: {},
    };
    hash._data[method] = callback;

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

    this.routeDB = Object.assign(this.routeDB, hash);

    return this;
  },

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

  take: function(method, url, params) {
    if (typeof url != "string") {
      throw new IncorrectArgumentType("Routes.take: Url must be string, not " + typeof url + ".");
    }

    var route = {};

    //Check for the perfect route
    var segs = url.split("/");
    var seg;
    var hash = this.routeDB;
    for (var i = 0, len = segs.length; i < len; i++) {
      seg = segs[i];

      if (seg === "") {
        continue;
      }

      if (seg == "_data" || seg == "paramId") {
        return route;
      }

      if (hash[seg] === undefined) {
        //Detect parameters
        if (hash.param) {
          route = hash.param._data || route;
          params[hash.param.paramId] = seg;

          hash = hash.param;
        } else {
          return route;
        }
      } else {
        hash = hash[seg];
      }
    }

    if (hash._data) {
      //return a route
      route.callback = hash._data[method];
    }
    //return the possible params
    if (route.callback) {
      route.params = params;
    }
    return route;
  },

  serve: function(url, request, response) {
    var route = this.take(request.method, url.pathname, url.query);

    if (route && route.callback) {
      request.params = route.params;
      var data = route.callback(request, response, function(data) {
        next(response, data);
      });
      next(response, data);
      return true;
    }
    return false;
  },

  reset: function() {
    delete this.routeDB;
    this.routeDB = {};
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
    'Content-Type': 'text/plain'
  });
  res.end(body);
}

function IncorrectArgumentType(message) {
  this.name = "IncorrectArgumentType";
  this.message = message || "";
}

IncorrectArgumentType.prototype = Error.prototype;


function RouteData(url) {

}

RouteData.prototype = {
  url: "",
  callbacks: [],
  
  call: function(request, response) {

  },

  do: function(callback){

  },

  before: function(callback){

  },

  requires: function(callback) {

  }
};