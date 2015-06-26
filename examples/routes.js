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
};

//Start the server
var server = ServeMe(options, port);

//Lets count visits!
var counter = 0;

server.routes.get("/", function() {
  counter += 1;
  return "" + counter;
});
//Each time localhost:3000/ is visited the counter value is shown.

//You can use dynamic routes now.
server.routes.get("/user/:name", function(params) {
  return "This is the page of "+params.name;
});
//Visit localhost:3000/user/victor to see his page. ;)

//You can use even multiple dynamic routes
server.routes.get("/user/:name/profile/:id", function(params) {
  return "This is the profile of "+params.name+ " with id " + params.id;
});

server.start();