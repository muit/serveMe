# Serve-Me

[![NPM](https://nodei.co/npm/serve-me.png?downloadRank=true&stars=true)](https://nodei.co/npm/serve-me/)

[![Build Status](https://travis-ci.org/muit/serveMe.svg)](https://travis-ci.org/muit/serveMe)
![Downloads](http://img.shields.io/npm/dm/serve-me.svg)

ServeMe is a [DSL](http://en.wikipedia.org/wiki/Domain-specific_language) for creating simple web applications with nodejs.
```javascript
ServeMe = require('serve-me')();

ServeMe.start(3000);
```

## Installing

```
npm install serve-me
```

## Setting up the options
The options can be set in the ServeMe loading, but by default it will use the folder "./public" and the file "index.html".
```javascript
//Require the module
ServeMe = require("serve-me");

//Set the options
ServeMe = ServeMe({
    debug: true,
        /**If debug mode is enabled, it will load each file again every http request, else the files will wait in cache.
         * Also prints more logs
        **/

    log: true,
        //If log is enabled the server reports all the files served and more information.

    home: "mypage.html",
        //home will change the default html file served ('index.html')

    directory: "./www",
        //home will change the default public folder ('./public')

    error: {
        404: "404.html",
        500: "500.html"
        /**Error pages depending on the error code.
         * That specified files must exist in the 'public/error' folder.
         *     Model: 'errorcode': "file.html"
        **/
    },

    secure: false,
        //Will use https when enabled.
        //ATENTION: A key and a certificate must be provided.

    //By default serve-me will use:
    key: "./keys/key.pem",
    cert: "./keys/cert.pem",
});

//Start the server
ServeMe.start(3000);//3000 is the port. Of course you can change it.
```

## Routes

To add specific actions to url paths ServeMe includes Routes.

Create a route example:
```javascript
ServeMe.Routes.add("/hello", function(){
    return "Hello World!";
});
```

Delete a route example:
```javascript
ServeMe.Routes.reset("/hello");
```

## Events

To add actions to specific events yo can use the ServeMe Events.
```javascript
ServeMe.on("event_name", function(data){
    console.log("I am an event!");
});
```
"event_name" is the name required to select de action wanted.

These are the available events for now:
  - "http_request": Will be called each http connection.
  - "new_session":  Will be called when a new session can be created.
  - "end_session":  Will be called when an existing session lifetime ends.
  - "session":      Will be called when an existing session connects.
  - "error":        Will be called when an error appears.

If you want to create your own event, you can activate it with:
```javascript
ServeMe.call("event_name");
```

## Issues

Let me know your suggestions and bugs found to improve Serve-me [here!](https://github.com/muit/serveMe/issues)!

[https://github.com/muit/serveMe/issues](https://github.com/muit/serveMe/issues)

## License

The MIT License (MIT)

Copyright (c) 2014-2015 @muitxer (https://github.com/muit)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

