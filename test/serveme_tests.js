var request   = require('request'),
    expect        = require('expect.js'),
    urlParser    = require('url');

describe('ServeMe HttpServer', function(){
    var ServeMe;

    before(function(done){
        ServeMe = require("..")({log: false});
        done();
    });

    it('can be loaded',function(done)
    {
        expect(ServeMe).not.to.be(undefined);
        expect(ServeMe.server).not.to.be(undefined);

        done();
    });

    it('can be started',function(done)
    {
        expect(ServeMe.start(3000)).not.to.be(null);
        done();
    });

    after(function ()
    {
        ServeMe.stop();
    });
});


describe('ServeMe Routes',function()
{
    var ServeMe;

    before(function(done)
    {
        ServeMe = require("..")({log:false});
        done();
    });

    it('can add a route', function(done)
    {
        var name = "/testadd",
        callback = function(){
            return "added a route";
        };
        ServeMe.Routes.add(name, callback);

        expect(ServeMe.Routes._hashIds[name].callback).to.be(callback);
        done();
    });

    it('can´t get an uncreated route', function(done)
    {
        var name = "/testget";

        expect(ServeMe.Routes.take(name)).to.be(undefined);
        done();
    });

    it('can get a created route', function(done)
    {
        var name = "/testget",
        callback = function(){
            return "got a route";
        };
        ServeMe.Routes.add(name, callback);

        expect(ServeMe.Routes.take(name).callback).to.be(callback);
        done();
    });

    it('can reset a route', function(done)
    {
        var name = "/";

        ServeMe.Routes.add(name, function(){
            return "got a route";
        });

        expect(function(){
            ServeMe.Routes.reset(name);
        }).not.to.throwException();
        expect(ServeMe.Routes.take(name)).to.be(undefined);
        done();
    });

    it('can reset all routes', function(done)
    {
        ServeMe.Routes.add("foo", function(){
            return "got a route";
        });

        expect(function(){
            ServeMe.Routes.reset("all");
        }).not.to.throwException();
        expect(ServeMe.Routes._hashIds).to.be.ok();
        done();
    });

    it('says Hello!', function(done)
    {
        ServeMe.stop();
        ServeMe = require("..")({log: false});
        ServeMe.start(3000);

        ServeMe.Routes.add("/hello",function(){
            return "Hello World";
        });

        request.get('http://localhost:'+3000+'/hello', function (err, res, body)
        {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.equal("Hello World");
            done();
        });
    });

    after(function ()
    {
        ServeMe.stop();
    });
});


describe('ServeMe Sessions', function()
{
    var ServeMe;

    before(function(done)
    {
        ServeMe = require("..")({
            log: false,
            session:
            {
                enabled: true,
                persistence: false,
                lifetime: 86400
            }
        });
        done();
    });

    it('exists', function(done)
    {
        expect(ServeMe.Session).not.to.be(undefined);
        done();
    });

    it('cant create a session whitout loading Sessions', function(done)
    {
        ServeMe.stop();
        ServeMe = require("..");

        expect(function(){
            new ServeMe.Session("0", {
                path:   "/session/login",
                domain: "localhost"
            });
        }).to.throwException();

        done();

        ServeMe = require("..")({
            session:
            {
                enabled: true,
                persistence: false,
                lifetime: 86400
            }
        });
    });

    it('can create a session', function(done)
    {
        var session = new ServeMe.Session("0", {
            path:   "/session/login",
            domain: "localhost"
        });
        expect(session).to.be.a(ServeMe.Session);

        done();
    });

    it('created sessions contains correct arguments', function(done)
    {
        var session = new ServeMe.Session("0", {
            path:   "/session/login",
            domain: "mysite.com"
        });
        expect(session.path).to.be("/session/login");
        expect(session.domain).to.be("mysite.com");

        done();
    });

    after(function ()
    {
        ServeMe.stop();
    });
});
