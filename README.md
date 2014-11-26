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
        //(Optional) If log is enabled the server reports all the files served and more information.

    home: "mypage.html",
        //(Optional) home will change the html file served in "/" (by default: 'index.html')

    directory: "./www",
        //(Optional) directory will change the default public folder ('./public')

    error: {
        404: "404.html",
        500: "500.html"
        /**Error pages depending on the error code.
         * That specified files must exist in the 'public/error' folder.
         *     Model: 'errorcode': "file.html"
        **/
    },

    //(Optional)
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

To create get or post method routes, you can use these methods:
```javascript
ServeMe.Routes.get("/", function(){
    return "Using a get method!";
});

ServeMe.Routes.post("/", function(){
    return "Using a post method!";
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

## Sessions

The sessions have been implemented to facilitate the creation of user sessions or similar tasks, mainly using cookies.

First of all we need to enable sessions in the serveme options:
```javascript
ServeMe = ServeMe({
    debug: false,

    sessions:{
        enabled: true, //Enable sessions
        persistence: true, //if false disables the lifetime, and the session never ends (default true)
        lifetime: 86400, //Life of the session in seconds (default: 1 day)
        new_session_url: "/session/new", //Url selected to create sessions
        //new session petition will be created each visit
    }
});
```

Then "session/new" will reqistry each visitor in a new session. But one more step is needed. To alow the customization of the session registry you can use the "new_session" event like this:
```javascript
var username = "bear",
    password = "drowssap";
ServeMe.on("new_session", function(new_session){
    //new_session.data contains all the url arguments.
    //Login example:
    if( new_session.data.username == username &&
        new_session.data.password == password)
    {
        //if there are the correct credentials allow a new session creation, returning true.
        return true;
    }
    //else returning false.
    return false;
});
```

session.data contains all the url arguments, for example a session request like
```javascript
/session/new?username=bear&password=drowssap
```

will give us that session.data:
```javascript
>{
>    username: "bear",
>    password: "drowssap"
>}
```

## Cluster
Cluster if the functionality that allows serve-me to run in multi-threading mode.

It must be enabled in the initial options:
```javascript
ServeMe = require("serve-me");

ServeMe = ServeMe({
    cluster: {
        // Enabling cluster
        enabled: true,

        // Amount of cpus that will be used. By default is "max".
        cpus: "max"

        // 'cpus' needs to be a number. If not it will be the maximum amount of cpus ("max")
    },
});

ServeMe.start(3000);
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

