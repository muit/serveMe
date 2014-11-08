var request = require('request');
var expect = require('expect.js');
var urlParser = require('url');

describe('ServeMe HttpServer',function(){
    var ServeMe;

    before(function(done){
        ServeMe = require("..");
        done();
    });

    it('can be loaded',function(done){
        ServeMe = ServeMe();
        expect(ServeMe).not.to.be(undefined);
        expect(ServeMe.server).not.to.be(undefined);

        done();
    });

    it('can be started',function(done){
        ServeMe = ServeMe();
        ServeMe.start(3000);

        expect(ServeMe).not.to.be(undefined);
        expect(ServeMe.server).not.to.be(undefined);
        expect(ServeMe.server).not.to.be(null);

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

    it('can add a route', function(done){
        var name = "/testadd",
        callback = function(){
            return "added a route";
        };
        ServeMe.Routes.add(name, callback);

        expect(ServeMe.Routes.hashIds[name]).to.be(callback);
        done();
    });

    it('can get an uncreated route', function(done){
        var name = "/testget";

        expect(ServeMe.Routes.get(name)).to.be(undefined);
        done();
    });

    it('can get a created route', function(done){
        var name = "/testget",
        callback = function(){
            return "got a route";
        };
        ServeMe.Routes.add(name, callback);

        expect(ServeMe.Routes.get(name)).to.be(callback);
        done();
    });

    it('can reset a route', function(done){
        var name = "/";

        ServeMe.Routes.add(name, function(){
            return "got a route";
        });

        expect(ServeMe.Routes.reset(name)).to.be(true);
        expect(ServeMe.Routes.get(name)).to.be(undefined);
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
