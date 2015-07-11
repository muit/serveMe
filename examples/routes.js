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

//Same routes with different methods
server.routes.get("/user", function(params) {
  return "All the users are here :3";
});

server.routes.post("/user", function(params) {
  return "New user";
});

//You can use dynamic routes.
server.routes.get("/user/:name/profile/:id", function(params) {
  return "This is the profile of " + params.name + " with id " + params.id;
});


//Answer with a different status
server.routes.get("/admin", function(params) {
  return {
    status: 403,
    body: "Cant access here!"
  };
});

server.start();