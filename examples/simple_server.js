//Require serve-me package
var ServeMe = require('..');

//*******************************
// HTTP SERVER
// Only server the html & other files
//*******************************
var port = 3000;
var options = {
  directory: "./examples/public",
  debug: false,
  log: true,
  secure: false
};

//Start the Server
var serveMe = ServeMe(options, port);
serveMe.start();

//Route example
serveMe.routes.get("/hello", function() {
  return "hello world!";
});

//Event example
serveMe.on("http_request", function() {
  console.log("Hey! One more friend...");
});