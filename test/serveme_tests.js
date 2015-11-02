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

  /* Decreaped
  it('can reset a route', function(done) {
    var name = "/";

    server.routes.get(name, function() {
      return "got a route";
    });

    expect(function() {
      server.routes.reset(name);
    }).not.to.throwException();
    expect(server.routes.take(name)).to.be(undefined);
    done();
  });
  */

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
      console.log(err);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal("Hello World");
      done();
    });
  });

  after(function() {
    server.stop();
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