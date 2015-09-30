var urlParser = require('url');

/**
 * Module exports.
 */
module.exports = exports = Session;

var ServeMe;

function Session(arg, opts) {
  if (!(this instanceof Session)) {
    ServeMe = arg;

    if (ServeMe.config.session.enabled) {
      if (ServeMe.config.session.lifetime) {
        ServeMe.config.session.persistence = ServeMe.config.session.persistence ? ServeMe.config.session.persistence : true;
      } else {
        ServeMe.config.session.persistent = false;
        ServeMe.config.session.lifetime = 3600;
      }
    }
  } else {
    if (!ServeMe) {
      throw new SessionNotLoaded("Session must be loaded.");
    }
    if (typeof opts != "object") {
      throw new IncorrectArgument("Session options cant be a " + typeof opts + ".");
    }
    if (typeof arg != "string") {
      throw new IncorrectArgument("Session id cant be a " + typeof arg + ".");
    }

    this.id = arg;
    this.data = opts.data || {};
    this.path = opts.path;
    if (opts.domain != "localhost") {
      this.domain = opts.domain;
    }
  }
}

Session._sessions = {};
Session.timeout = undefined;

Session.lookupOrCreate = function(url, request) {
  if (!ServeMe.config.session.enabled) {
    return;
  }

  var id = Session.getIdFromRequest(request, {}),
    session,
    data;

  if (session = Session._sessions[id]) {
    data = ServeMe.call("session", {
      session: session
    });
  } else if (url.pathname == ServeMe.config.session.new_session_url) {
    session = new Session(id, {
      path: ServeMe.config.session.global_path ? undefined : url.pathname,
      data: url.query,
      domain: request.domain
    });

    var result = ServeMe.call("new_session", {
      session: session,
      request: request
    });

    if (result !== false && result !== undefined) {
      Session._sessions[id] = session;
      data = result;
    } else {
      session = undefined;
    }
  }

  if (!this.timeout) {
    this.timeout = setTimeout(Session.cleanUp, 60000);
  }
  if (session) {
    session.expiration = (+new Date()) + ServeMe.config.session.lifetime * 1000;
  }

  return {
    session: session,
    data: data
  };
};

Session.lookup = function(url, request) {
  if (!ServeMe.config.session.enabled) {
    return;
  }

  var id = Session.getIdFromRequest(request, {}),
    session;

  if (session = Session._sessions[id]) {
    ServeMe.call("session", {
      session: session,
      request: request
    });
  }

  if (!this.timeout) {
    this.timeout = setTimeout(Session.cleanUp, 60000);
  }
  if (session) {
    session.expiration = (+new Date()) + ServeMe.config.session.lifetime * 1000;
  }

  return session;
};

Session.cleanUp = function() {
  ServeMe.log("ServeMe: Cleaning Sessions.")
  var now = +new Date();
  var next = Infinity;
  this.timeout = null;

  for (var id in Session._sessions) {
    if (hasOwnProp(Session._sessions, id)) {
      var session = Session._sessions[id];
      if (session.expiration < now) {
        ServeMe.call("end_session", session);
        delete session;
      } else
        next = (next < session.expiration) ? next : session.expiration;
    }
  }

  if (next < Infinity)
    this.timeout = setTimeout(Session.cleanUp, next - (+new Date()) + 1000);
};

Session.reset = function() {
  Session._sessions = {};
  ServeMe = undefined;
};

Session.getIdFromRequest = function(req, opts) {
  if (req.headers.cookie) {
    var m = /SID=([^ ,;]*)/.exec(req.headers.cookie);
    if (m && hasOwnProp(this._sessions, m[1])) {
      return m[1];
    }
  }

  if (opts.sessionID) {
    return opts.sessionID;
  }
  return randomString(64);
};

Session.prototype.getSetCookieHeaderValue = function() {
  var parts = ['SID=' + this.id];
  if (this.path) {
    parts.push('path=' + this.path);
  }

  if (this.domain) {
    parts.push('domain=' + this.domain);
  }

  if (ServeMe.config.session.persistence ? ServeMe.config.session.persistence : true) {
    parts.push('expires=' + msUTCString(this.expiration));
  }

  return parts.join('; ');
};

Session.prototype.destroy = function() {
  delete Session._sessions[this.id];
};



function msUTCString(ms) {
  return (new Date(ms)).toUTCString();
}

function hasOwnProp(o, p) {
  return Object.prototype.hasOwnProperty.call(o, p);
}

function randomString(bits) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    rand,
    i,
    ret = '';

  while (bits > 0) {
    rand = Math.floor(Math.random() * 0x100000000);
    for (i = 26; i > 0 && bits > 0; i -= 6, bits -= 6)
      ret += chars[0x3F & rand >>> i];
  }
  return ret;
}

function IncorrectArgument(message) {
  this.name = "IncorrectArgument";
  this.message = (message || "");
}
IncorrectArgument.prototype = Error.prototype;

function SessionNotLoaded(message) {
  this.name = "SessionNotLoaded";
  this.message = (message || "");
}
SessionNotLoaded.prototype = Error.prototype;