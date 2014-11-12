//Require serve-me package
var ServeMe = require('..');

//*******************************
// HTTP SERVER
// Only server the html & other files
//*******************************
var port = 3000;
var options = {
    debug: false,
    log: false
};

//Lets count visits!
var counter = 0;

ServeMe.Routes.add("/", function()
{
    counter += 1;
    return ""+counter;
});
//Each time localhost:3000/ is visited the counter value is shown.


//Start the server
ServeMe = ServeMe(options, port);
ServeMe.start();
