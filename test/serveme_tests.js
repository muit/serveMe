var request = require('request');

describe('ServeMe HttpServer',function(){
    var ServeMe;

    before(function(done){
        ServeMe = require("..")();
    });

    it('loads correctly',function(){
        expect(ServeMe).to.not.throw(Error);
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
    });

    it('says Hello!', function()
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
