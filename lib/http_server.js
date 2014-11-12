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
    ServeMe.call("http_request", request);
    var url = urlParser.parse(request.url, true);
    var client = request.headers['X-Forwarded-For'] || request.connection.remoteAddress;

    //Route detection
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
            return;
        }
    }

    ServeMe.log("\nServing "+url.pathname+" to "+client);

    if (url.pathname == '/')
    {
        self.serveHome(self, request, response);
        return;
    }

    // Avoid going out of the home dir
    if (url.pathname.contains('..'))
    {
        self.serveError(404, request, response);
        return;
    }

    if (url.pathname.startsWith('/src/'))
    {
        self.serveFile(200, '..' + url.pathname, request, response);
        return;
    }
    self.serveFile(200, url.pathname, request, response);
};

/******************************
 * Serve index.html
 * @api private
 ******************************/
HttpServer.prototype.serveHome = function(self, request, response)
{
    self.serveFile(200, '/'+this.options.home, request, response);
};

/******************************
 * Serve js or css
 * @api private
 ******************************/
HttpServer.prototype.serveFile = function(status, file, request, response)
{
    var self = this,
        path = this.options.directory + file;

    if(this.options.debug || this.files[path] === undefined)
    {
        fs.readFile(path, function(err, data)
        {
            if (err)
            {
                self.serveError(404, request, response);
                ServeMe.log("  Couldn't serve file. 404.");
                return;
            }
            if(!self.options.debug)
            {
                self.files[path] = data;
            }
            ServeMe.log("  Served file from disk.");
            writeResponse(status, file, data, request, response);
        });
    }
    else
    {
        ServeMe.log("  Served file from cache.");
        writeResponse(status, file, this.files[path], request, response);
    }
};

/**
 * Will be called when an error appears
 * @api private
 */
HttpServer.prototype.serveError = function(status, request, response)
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
                writeResponse(500, "","ERROR: 500 - Internal server error.", request, response);
                throw new Error(status+" error page may not exist.\nSpecified file path: "+path+"\n");
            }

            if(!self.options.debug)
                self.files[path] = data;

            writeResponse(status, file, data, request, response);
        });
    }
    else
        writeResponse(status, file, this.files[path], request, response);
};

/**
 * @api private
 */
function writeResponse(status, file, data, request, response)
{
    var type = mime.get(file.split(".").pop());

    var head = {
        'Content-Length': data.length,
        'Content-Type': type
    };

    var session = ServeMe.Session.lookupOrCreate(request);
    if(session)
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
