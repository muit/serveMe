//Require serve-me package
var ServeMe = require('..');

//*******************************
// HTTP SERVER
// Only server the html & other files
//*******************************
var port = 3000;
var options = {
    home: "index.html",
    directory: "./examples/public",
    debug: false,
    log: true,
    secure: false
};

//Start the Server
ServeMe = ServeMe(options, port);
ServeMe.start();

//Route example
ServeMe.Routes.add("/hello", function()
{
    return "hello world!";
});

//Event example
ServeMe.on("http_request", function()
{
    console.log("Hey! One more friend...");
});

//New session event
ServeMe.on("new_session", function()
{
    console.log("Hey! One more friend...");
    return true;
});
