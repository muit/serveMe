/**
 * Module exports.
 */
module.exports = exports = Routes;

require("./util");

function Routes() {}

Routes.prototype = {
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
      data: {
        "callback": callback,
        "method": method
      }
    };
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

  delete: function(url, callback) {
    this.add(url, "DELETE", callback);
    return this;
  },

  take: function(url, params) {
    if (typeof url != "string") {
      throw new IncorrectArgumentType("Routes.take: Url must be string, not " + typeof url + ".");
    }

    var route;

    //Check for the perfect route
    var segs = url.split("/");
    var seg;
    var hash = this.routeDB;
    for (var i = 0; i < segs.length; i++) {
      seg = segs[i];

      if (seg === "") {
        continue;
      }

      if (seg == "data" || seg == "paramId") {
        return;
      }

      if (hash[seg] === undefined) {
        //Detect parameters
        if (hash.param) {
          route = hash.param.data;
          params[hash.param.paramId] = seg;

          hash = hash.param;
        } else {
          return;
        }
      } else {
        hash = hash[seg];
      }
    }
    //return a route
    route = hash.data;
    //return the possible params
    if (route) {
      route.params = params;
    }
    return route;
  },

  reset: function() {
    delete this.routeDB;
    this.routeDB = {};
  }
};

function IncorrectArgumentType(message) {
  this.name = "IncorrectArgumentType";
  this.message = message || "";
}

IncorrectArgumentType.prototype = Error.prototype;