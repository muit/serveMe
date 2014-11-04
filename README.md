# Serve-Me

[![Build Status](https://travis-ci.org/muit/serveMe.svg)](https://travis-ci.org/muit/serveMe)
[![NPM Version](https://badge.fury.io/js/serve-me.svg)](http://badge.fury.io/js/serve-me)
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

