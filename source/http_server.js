'use strict';

//*******************************
// HTTP SERVER
// Only server the html & files
//*******************************

var urlParser = require('url');
var fs = require('fs');
var mime = require("./mime.js");

exports.start = function(port, options)
{
    return new HttpServer(port, options);
}

//*******************************
// Http Server Class
//*******************************

var HttpServer = function(port, options){
    if (!options){
        options = {
            secure: false,
            debug: false,
            home: "index.html",
            key: "./keys/key.pem",
            cert: "./keys/cert.pem",
            error: {
                404: "404.html", 
                500: "500.html",
            }
        }
    }
    if(!options.error){
        options.error = {
            404: "404.html", 
            500: "500.html",
        }
    }
    if(!options.debug) options.debug = false;
    if(!options.secure) options.secure = false;

    this.options = options;
    var self = this;

    if (!options.secure){
        var http = require('http');

        this.server = http.createServer(function(request, response){
            self.serve(self, request, response);
        });
    }
    else
    {
        if(!options.key) throw new Error("ServerMe: Key path is empty.");
        if(!options.cert) throw new Error("ServerMe: Certificate path is empty.");

        var https = require('https');

        var options = {
            key: fs.readFileSync(options.key),
            cert: fs.readFileSync(options.cert),
        };
        this.server = https.createServer(options, function(request, response){
            self.serve(self, request, response);
        });
    }

    this.server.on('error', function (e) {
        // Handle Http error
        throw new Error("An error ocurred in the server: "+e);
    });

    this.server.listen(port, function() {
        console.log('HttpServer: Running at port:   ' + port);
        console.log('HttpServer: Secure mode(https) ' + ((options.secure)?"enabled":"disabled"));
        console.log('HttpServer: Debug mode         ' + ((options.debug)?"enabled":"disabled"));
    });
}

/******************************
 * Stop server
 ******************************/
 HttpServer.prototype.stop = function(){
    this.server.close();
 }

/******************************
 * Save files if not debugging
 ******************************/
HttpServer.prototype.files = {};

/******************************
 * Serve files or code
 ******************************/
HttpServer.prototype.serve = function(self, request, response){
    var url = urlParser.parse(request.url, true);
    var client = request.headers['X-Forwarded-For'] || request.connection.remoteAddress;
    console.log("\nServing "+url.pathname+" to "+client);
    if (url.pathname == '/')
    {
        self.serveHome(self, request, response);
        return;
    }
    // avoid going out of the home dir
    if (url.pathname.contains('..'))
    {
        self.serveError(404, response);
        return;
    }
    if (url.pathname.startsWith('/src/'))
    {
        self.serveFile(200, '..' + url.pathname, response);
        return;
    }
    self.serveFile(200, url.pathname, response);
}

//*******************************
// Serve index.html
HttpServer.prototype.serveHome = function(self, request, response){
    self.serveFile(200, '/'+this.options.home, response);
}

//*******************************
// Serve js or css
HttpServer.prototype.serveFile = function(status, file, response){
    var self = this, 
        path = './public' + file;
    
    if(this.options.debug || this.files[path] == undefined){
        fs.readFile(path, function(err, data) {
            if (err){
                self.serveError(404, response);

                console.log("  Couldn't serve file. 404.");
                return;
            }

            if(!self.options.debug){
                self.files[path] = data;
            }
            console.log("  Served file from disk.");
            writeResponse(status, file, data, response);
        });
    }
    else{
        console.log("  Served file from cache.");
        writeResponse(status, file, this.files[path], response);
    }
}

HttpServer.prototype.serveError = function(status, response){
    if(!this.options.error[status])
        throw new Error("The error page "+status+" is not defined.\nYou must set 'options.error["+status+"]' to something!");
    
    var self = this,
        file = this.options.error[status],
        path = './public/error/' + file;
    
    if(this.options.debug || this.files[path] == undefined){
        fs.readFile(path, function(err, data) {
            if (err)
            {
                writeResponse(500, "","ERROR: 500 - Internal server error.", response);
                throw new Error(status+" error page may not exist.\nSpecified path: "+path);
            }

            if(!self.options.debug) 
                self.files[path] = data;

            writeResponse(status, file, data, response);
        });
    }
    else{
        writeResponse(status, file, this.files[path], response);
    }
}

function writeResponse(status, file, data, response){
    var type = mime.get(file.split(".").pop());

    response.writeHead(status, {
        'Content-Length': data.length,
        'Content-Type': type
    });

    response.end(data);
}

