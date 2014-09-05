'use strict';

//*******************************
// HTTP SERVER
// Only server the html & files
//*******************************

var urlParser = require('url');
var fs = require('fs');

exports.start = function(port, options)
{
    return new HttpServer(port, options);
}

//*******************************
// Http Server Class
//*******************************

var HttpServer = function(port, options){
    var self = this;

    if (options == undefined)
        options = {
            secure: false,
            debug: false,
        }
    
    if(options.debug == undefined)
        this.debug = false;
    else
        this.debug = options.debug;
    
    this.files = {};

    if (options.secure == undefined || !options.secure){
        var http = require('http');
        var server = http.createServer(function(request, response){
            self.serve(self, request, response);
        });
    }
    else
    {
        var options = {
            key: fs.readFileSync("keys/key.pem"),
            cert: fs.readFileSync("keys/cert.pem")
        };
        var https = require('https');
        var server = https.createServer(options, function(request, response){
            self.serve(self, request, response);
        });
    }

    

    server.listen(port, function() {
        console.log('Http server running at port: ' + port);
    });
}

//*******************************
// Serve files or code
HttpServer.prototype.serve = function(self, request, response){
    var url = urlParser.parse(request.url, true);

    if (url.pathname == '/')
    {
        self.serveHome(self, request, response);
        return;
    }
    if (url.pathname == '/serve')
    {
        // will serve websocket
        return;
    }
    // avoid going out of the home dir
    if (url.pathname.contains('..'))
    {
        self.serveFile(404, 'not_found.html', response);
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
    self.serveFile(200, '/index.html', response);
}

//*******************************
// Serve js or css
HttpServer.prototype.serveFile = function(status, file, response){
    var self = this, 
        path = 'public' + file;
    
    function writeResponse(data, response){
        var type = 'text/html';

        if (file.endsWith('.js'))
            type = 'text/javascript';

        if (file.endsWith('.css'))
            type = 'text/css';

        response.writeHead(status, {
            'Content-Length': data.length,
            'Content-Type': type
        });

        response.end(data);
    }

    if(this.debug || this.files[path] == undefined){
        fs.readFile(path, function(err, data) {
            if (err)
            {
                response.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                response.end('Page not found');
                return;
            }

            if(!self.debug) self.files[path] = data;
            writeResponse(data, response);
        });
    }
    else{
        writeResponse(this.files[path], response);
    }
}
