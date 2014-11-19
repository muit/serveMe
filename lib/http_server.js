'use strict';

/******************************
 * ServeMe
 * Simple Web Server.
 ******************************/

var urlParser = require('url');
var fs        = require('fs');
var mime      = require("./mime.js");
var http      = require('http');
var https     = require('https');
if(typeof Utyl == "undefined") require("./utyl/utyl.js");
var ServeMe;

module.exports = exports = HttpServer;
/******************************
 * Http Server Class
 *
 * @api public
 ******************************/
function HttpServer(main, port)
{
    ServeMe = main;
    if(!port){
        //Default port
        port = 8080;
        ServeMe.log("Need a port. Using "+port+" by default.");
    }

    var options = ServeMe.options || {
        secure: false,
        debug: false,
        home: "index.html",
        directory: "./public",
        key: "./keys/key.pem",
        cert: "./keys/cert.pem",
        error: {
            404: "404.html",
            500: "500.html",
        }
    };

    options.error = options.error || {
        404: "404.html",
        500: "500.html",
    };
    options.home      = options.home || "index.html";
    options.directory = generate_public_path(options.directory || "./public");
    options.debug     = options.debug || false;
    options.secure    = options.secure || false;

    var self = this;
    if (!options.secure)
    {
        this.server = http.createServer(function(request, response){
            self.serve(self, request, response);
        });
    }
    else
    {
        if(!options.key)
            throw new Error("ServerMe: Key path is empty.");
        if(!options.cert)
            throw new Error("ServerMe: Certificate path is empty.");

        var ssl = {
            key: fs.readFileSync(options.key),
            cert: fs.readFileSync(options.cert),
        };
        this.server = https.createServer(ssl, function(request, response){
            self.serve(self, request, response);
        });
    }

    this.options = options;

    this.server.on('error', function (e)
    {
        if(!ServeMe.call("error", e))
            throw new Error("An error ocurred in the server: "+e);
    });

    this.server.listen(port, function()
    {
        ServeMe.log('ServeMe: Running at port:   ' + port);
        ServeMe.log('ServeMe: Secure mode(https) ' + ((options.secure)?"enabled":"disabled"));
        ServeMe.log('ServeMe: Debug mode         ' + ((options.debug)?"enabled":"disabled"));
        if(options.session)
            ServeMe.log('ServeMe: Sessions           ' + ((options.session.enabled)?"enabled":"disabled"));
    });
}

/******************************
 * Stop server
 * @api public
 ******************************/
 HttpServer.prototype.stop = function()
 {
    this.server.close();
 };

/******************************
 * Save files if not debugging
 ******************************/
HttpServer.prototype.files = {};

/******************************
 * Serve files or code
 * @api private
 ******************************/
HttpServer.prototype.serve = function(self, request, response)
{
    ServeMe.call("http_request", {
        request: request, 
        response: response
    });
    
    var url = urlParser.parse(request.url, true);
    var client = request.headers['X-Forwarded-For'] || request.connection.remoteAddress;

    //Route detection
    if(self.serveRoute(url, response))
        return;

    ServeMe.log("\nServing "+url.pathname+" to "+client);

    if (url.pathname == '/'){
        self.serveHome(self, url, request, response);
    }
    else if (url.pathname.contains('..')){// Avoid going out of the home dir
        self.serveError(404, url, request, response);
    }
    else if (url.pathname.startsWith('/src/')){
        url.pathname = '..' + url.pathname;
        self.serveFile(200, url, request, response);
    }
    else{
        self.serveFile(200, url, request, response);
    }
};

/******************************
 * Serve index.html
 * @api private
 ******************************/
HttpServer.prototype.serveHome = function(self, url, request, response)
{
    url.pathname = '/'+this.options.home;
    self.serveFile(200, url, request, response);
};

/******************************
 * Serve js or css
 * @api private
 ******************************/
HttpServer.prototype.serveFile = function(status, url, request, response)
{
    var self = this,
        path = this.options.directory + url.pathname;

    if(this.options.debug || this.files[path] === undefined)
    {
        fs.readFile(path, function(err, data)
        {
            if (err)
            {
                self.serveError(404, url, request, response);
                ServeMe.log("  Couldn't serve file. 404.");
                return;
            }
            if(!self.options.debug)
            {
                self.files[path] = data;
            }
            ServeMe.log("  Served file from disk.");
            writeResponse(status, url, data, request, response);
        });
    }
    else
    {
        ServeMe.log("  Served file from cache.");
        writeResponse(status, url, this.files[path], request, response);
    }
};

/**
 * Will be called when an error appears
 * @api private
 */
HttpServer.prototype.serveError = function(status, url, request, response)
{
    if(!this.options.error[status])
        throw new Error("The error page "+status+" is not defined.\nYou must set 'options.error["+status+"]' to something!");

    var self = this,
        file = this.options.error[status],
        path = this.options.directory + '/error/' + file;

    if(this.options.debug || this.files[path] === undefined)
    {
        fs.readFile(path, function(err, data)
        {
            if (err)
            {
                writeResponse(500, url, "ERROR: 500 - Internal server error.", request, response, "");
                throw new Error(status+" error page may not exist.\nSpecified file path: "+path+"\n");
            }

            if(!self.options.debug)
                self.files[path] = data;

            writeResponse(status, url, data, request, response, file);
        });
    }
    else
        writeResponse(status, url, this.files[path], request, response, file);
};

HttpServer.prototype.serveRoute = function(url, response){
    if(this.routes)
    {
        var callback = this.routes.get(url.pathname);
        if(callback)
        {
            var data = callback();
            if(data && data.length !== undefined)
            {
                response.writeHead(200, {
                    'Content-Length': data.length,
                    'Content-Type': 'text/plain'
                });

                response.end(data);
            }
            return true;
        }
    }
    return false;
};

/**
 * @api private
 */
function writeResponse(status, url, data, request, response, file)
{
    var session,
    type = mime.get(((file)? file : url.pathname).split(".").pop()),
    head = {
        'Content-Length': data.length,
        'Content-Type': type
    };

    if(url.pathname == ServeMe.Session.options.new_session_url)
        if(session = ServeMe.Session.lookupOrCreate(url, request))
            head['Set-Cookie'] = session.getSetCookieHeaderValue();

    response.writeHead(status, head);
    response.end(data);
}

/**
 * @api private
 */
function generate_public_path(relative_path)
{
    if(typeof relative_path === "string")
        if(relative_path[0] === ".")
            return [process.cwd().replace("\\", "/"), relative_path.slice(1)].join('');
    return relative_path;
}
