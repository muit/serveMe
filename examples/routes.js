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

server.get("/", function() {
  counter += 1;
  return "" + counter;
});
//Each time localhost:3000/ is visited the counter value is shown.

//Same routes with different methods
server.get("/user", function() {
  return "All the users are here :3";
})
.post("/user", function() { //Routes can be anidated.
  return "New user";
});

//You can use dynamic routes.
server.get("/user/:name/profile/:id", function(req) {
  return "This is the profile of " + req.params.name + " with id " + req.params.id;
});


//Answer with a different status
server.get("/admin", function() {
  return {
    status: 403,
    body: "Cant access here!"
  };
});

//Need async on your routes? 
server.get("/chicken", function(req, next) {
  next({
    status: 404,
    body: "There is no chicken",
  });
});


server.get("/index.html").require(
  function() {
    //Authenticated?
    return false; 
  }, 
  function(req, res){ 
    return "Cant enter here!";
  }
);

//Create a fast redirection
server.get("/lobby", "/lobby.html");

server.start();