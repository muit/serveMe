var request = require('request');
var expect = require('expect.js');

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

    it('says Hello!', function(done)
    {
        var port = 3000;
        ServeMe.start(port);

        ServeMe.Routes.add("/hello",function(){
            return "Hello World";
        });

        request.get('http://localhost:'+port+'/hello', function (err, res, body){
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
