var request = require('request');
var expect = require('expect.js');
var urlParser = require('url');

describe('ServeMe HttpServer',function(){
    var ServeMe;

    before(function(done){
        ServeMe = require("..");
        done();
    });

    it('loads correctly',function(done){
        ServeMe = ServeMe();
        expect(ServeMe).not.to.be(undefined);
        expect(ServeMe.server).not.to.be(undefined);

        done();
    });

    after(function ()
    {
        ServeMe.stop();
    });
});

describe('ServeMe Routes',function(){
    var ServeMe;

    before(function(done)
    {
        ServeMe = require("..")();
        done();
    });

    it('adds a route', function(done){
        var name = "/testadd",
        callback = function(){
            return "added a route";
        };
        ServeMe.Routes.add(name, callback);

        expect(ServeMe.Routes.hashIds[name]).to.be(callback);
        done();
    });

    it('gets an uncreated route like undefined', function(done){
        var name = "/testget";

        expect(ServeMe.Routes.get(name)).to.be(undefined);
        done();
    });

    it('gets a created route', function(done){
        var name = "/testget",
        callback = function(){
            return "got a route";
        };
        ServeMe.Routes.add(name, callback);

        expect(ServeMe.Routes.get(name)).to.be(callback);
        done();
    });

    it('says Hello!', function(done)
    {
        ServeMe.start(3000);

        ServeMe.Routes.add("/hello",function(){
            return "Hello World";
        });

        request.get('http://localhost:'+3000+'/hello', function (err, res, body){
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

describe('ServeMe Sessions',function(){
    var ServeMe;

    before(function(done)
    {
        ServeMe = require("..")({
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

    it('creates a session', function(done){
        var session = new ServeMe.Session(0, {
            path:   "/session/login",
            domain: "localhost"
        });
        expect(session).to.be.a(ServeMe.Session);

        done();
    });

    it('created sessions contains correct arguments', function(done){
        var session = new ServeMe.Session(0, {
            path:   "/session/login",
            domain: "localhost"
        });
        expect(session.path).to.be("/session/login");
        expect(session.domain).to.be("localhost");

        done();
    });

    after(function ()
    {
        ServeMe.stop();
    });
});
