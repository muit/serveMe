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
var serveMe = ServeMe({
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
serveMe.start(3000);//3000 is the port. Of course you can change it.
```

## Routes

To add specific actions to url paths ServeMe includes Routes.

Create a route example:
```javascript
serveMe.get("/hello", function(){
    return "Hello World!";
});
```

You can create get, post, update or other method routes, and add different behaviours to them.
```javascript
serveMe.get("/user", function(){
    return "I get all the users";
});

serveMe.post("/user", function(){
    return "I create an user";
});
```

Routes overview:
```javascript
serveMe.METHOD("path", function(request, response, next){
    var result = "" //Direct response as text

    result = { //Custom response
        status: 200, //Result status
        body: "", //Response as text
        json: {}, //Response as json
    }

    next result; 
    //or
    return result;
});
```

### Responding with custom status or json
Just returning an object with some attributes, you will be able to customise your answer easily.
```javascript
serveMe.get("/api/profile", function(request){
    return {
        status: 404,

        //return a json
        json: {},
        //or return a simple text
        body: ""
    };
});
```

PD: You can anidate routes to have a simpler syntax.
```javascript
serveMe.get("/chicken", function(){
    return "fried_chicken";
})
.post("/cat", function(){
    return {
        json: {
            lives: 6
        }
    };
})
```

### Dynamic routes
Since v0.7.3 the dynamic routes are implemented. And.. nothing is better than some examples. 

```javascript
serveMe.get("/user/:name", function(req){
    return "This is the profile of " + req.params.name;
});

serveMe.get("/posts/:id", function(req){
    return "Post with id " + req.params.id;
});
```
With the dynamic routes you can have a dinamic content and rest api applications running easily on serve-me.

### Redirection Routes
To link urls to a view or file, replace the "callback" of a route with the url:
```javascript
serveMe.get("/lobby", "/lobby.html");
```

### Require
To make the development easier Serve-me have the require method, witch allows you to execute a route only in some situations.

```javascript
function fail(req, res, next) {
    return "Failed";
}

serveMe.get("/profile", doSomething).require( function(){
    //returns a boolean: true-> passed the require
    return true;
}, fail);
```
Fail will be calles when the require callback returns false.


### Reset
For specific uses you can reset all the routes:
```javascript
serveMe.routes.reset();
```

## Events

To add actions to specific events yo can use the ServeMe Events.
```javascript
serveMe.on("event_name", function(data){
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
serveMe.call("event_name");
```


## Sessions

The sessions have been implemented to facilitate the creation of user sessions or similar tasks, mainly using cookies.

First of all we need to enable sessions in the serveme options:
```javascript
var serveMe = ServeMe({
    debug: false,

    session:{
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
var username = "bear";
var password = "drowssap";

serveMe.on("new_session", function(new_session){
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

var serveMe = ServeMe({
    cluster: {
        // Enabling cluster
        enabled: true,

        // Amount of cpus that will be used. By default is "max".
        cpus: "max"

        // 'cpus' needs to be a number. If not it will be the maximum amount of cpus ("max")
    },
});

serveMe.start(3000);
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

