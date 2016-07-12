var request = require('request'),
  expect = require('expect.js'),
  urlParser = require('url');

describe('ServeMe HttpServer', function() {
  var ServeMe;

  before(function(done) {
    server = require("..")({
      log: false
    }, 3000);
    done();
  });

  it('can be loaded', function(done) {
    expect(server).not.to.be(undefined);
    expect(server.server).not.to.be(undefined);

    done();
  });

  it('can be started', function(done) {
    expect(server.start()).not.to.be(null);
    done();
  });

  it('can be reseted', function(done) {
    expect(function() {
      server.reset();
    }).not.to.throwException();
    done();
  });

  after(function() {
    server.stop();
  });
});

describe('ServeMe config', function() {

  before(function(done) {
    process.env['SERVE_ME_TEST_ENV_VAR_IP'] = '192.168.1.1';
    done();
  });

  after(function(done) {
    process.env['SERVE_ME_TEST_ENV_VAR_IP'] = undefined;
    done();
  });

  it('will load the hostname from an env variable', function(done) {
    server = require("..")({
      log: false,
      hostname_env_var : 'SERVE_ME_TEST_ENV_VAR_IP'
    }, 3000);
    expect(server).not.to.be(undefined);
    expect(server.server).not.to.be(undefined);
    expect(server.config.hostname).to.be('192.168.1.1');

    done();
  });

  it('will allow an undefined hostname', function(done) {
    server = require("..")({
      log: false
    }, 3000);
    expect(server).not.to.be(undefined);
    expect(server.server).not.to.be(undefined);
    expect(server.config.hostname).to.be(undefined);

    done();
  });

  it('will use an undefined hostname if env var is not available', function(done) {
    server = require("..")({
      log: false,
      hostname_env_var : 'SERVE_ME_TEST_ENV_VAR_IP_NOT_EXISTS'
    }, 3000);
    expect(server).not.to.be(undefined);
    expect(server.server).not.to.be(undefined);
    expect(server.config.hostname).to.be(undefined);

    done();
  });

});

describe('ServeMe Routes', function() {
  var server;

  before(function(done) {
    server = require("..")({
      log: false
    }, 3000);
    done();
  });

  it('can add a simple route and gets the callback', function(done) {
    var callback = function() {
      return "added a route";
    };
    server.get("/api/user", callback);

    expect(server.routes.simpleRouteDB["/api/user"]._action.GET.callbacks[0])
    .to.be(callback);
    done();
  });

  it('can add a complex route and gets the callback', function(done) {
    var callback = function() {
      return "added a route";
    };
    server.get("/api/user/:name", callback);

    expect(server.routes.complexRouteDB.api.user.param._action.GET.callbacks[0])
    .to.be(callback);
    done();
  });

  it('can´t get an uncreated route', function(done) {
    var action = server.routes.take("GET", "/user");
    expect(isEmpty(action)).to.be(true);
    done();
  });

  it('can get a simple route', function(done) {
    var callback = function() {
      return "added a route";
    };
    server.get("/api/user", callback);

    expect(server.routes.take("GET", "/api/user").callbacks[0]).to.be(callback);
    done();
  });

  it('can get a complex route', function(done) {
    var callback = function() {
      return "added a route";
    };
    server.get("/api/user/:name", callback);

    expect(server.routes.take("GET", "/api/user/:name").callbacks[0]).to.be(callback);
    done();
  });

  it('can require in a route', function(done) {
    var callback = function() {
      return "added a route";
    };

    var fail = function() {
      return "added a fail route";
    };

    server.get("/api/user", callback).require(
    function(){
      return true
    }, fail);

    expect(server.routes.take("GET", "/api/user").callbacks[0]).to.be(callback);
    expect(server.routes.take("GET", "/api/user").fails[0]).to.be(fail);

    done();
  });

  it('can reset all routes', function(done) {
    server.routes.get("/foo", function() {
      return "got a route";
    });

    expect(function() {
      server.routes.reset();
    }).not.to.throwException();
    expect(server.routes.simpleRouteDB).to.be.ok();
    expect(server.routes.complexRouteDB).to.be.ok();
    done();
  });

  it('can receive a route message', function(done) {
    server.reset();

    server.routes.get("/hello", function() {
      return "Hello World";
    });

    request.get('http://localhost:' + 3000 + '/hello', function(err, res, body) {
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal("Hello World");
      done();
    });
  });

  after(function() {
    server.stop();
  });

  it('can success a require in a route', function(done) {
    server.reset();

    var callback = function() { return "added a success route"; };

    var fail = function() { return ""; };

    server.get("/api", callback).require(
    function(){
      return true;
    }, fail);

    request.get('http://localhost:' + 3000 + '/api', function(err, res, body) {
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal("added a success route");
      done();
    });
  });

  it('can fail a require in a route', function(done) {
    server.reset();

    var callback = function() { return ""; };

    var fail = function() {
      return "added a fail route";
    };

    server.get("/api", callback).require(
    function(){
      return false;
    }, fail);

    request.get('http://localhost:' + 3000 + '/api', function(err, res, body) {
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal("added a fail route");
      done();
    });
  });

  it('will set the correct content type for String data', function(done) {
    server.reset();

    server.routes.get("/hello", function() {
      return "Hello World";
    });

    request.get('http://localhost:' + 3000 + '/hello', function(err, res, body) {
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal("Hello World");
      expect(res.headers['content-type']).to.equal('text/plain');
      done();
    });
  });

  it('will set the correct content type for JSON data', function(done) {
    server.reset();

    server.routes.get("/hello", function() {
      return {
        json: { test: true }
      };
    });

    request.get('http://localhost:' + 3000 + '/hello', function(err, res, body) {
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal('{"test":true}');
      expect(res.headers['content-type']).to.equal('application/json');
      done();
    });
  });

});


describe('ServeMe Sessions', function() {
  var ServeMe;

  before(function(done) {
    ServeMe = require("..")({
      log: false,
      session: {
        enabled: true,
        persistence: false,
        lifetime: 86400
      }
    });
    done();
  });

  it('exists', function(done) {
    expect(ServeMe.Session).not.to.be(undefined);
    done();
  });

  it('cant create a session whitout loading Sessions', function(done) {
    ServeMe.stop();
    ServeMe = require("..");

    expect(function() {
      new ServeMe.Session("0", {
        path: "/session/login",
        domain: "localhost"
      });
    }).to.throwException();

    done();

    ServeMe = require("..")({
      session: {
        enabled: true,
        persistence: false,
        lifetime: 86400
      }
    });
  });

  it('can create a session', function(done) {
    var session = new ServeMe.Session("0", {
      path: "/session/login",
      domain: "localhost"
    });
    expect(session).to.be.a(ServeMe.Session);

    done();
  });

  it('created sessions contains correct arguments', function(done) {
    var session = new ServeMe.Session("0", {
      path: "/session/login",
      domain: "mysite.com"
    });
    expect(session.path).to.be("/session/login");
    expect(session.domain).to.be("mysite.com");

    done();
  });

  after(function() {
    ServeMe.stop();
  });
});

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}