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
    session:{
        enabled: true,
        //OPTIONAL:
        //Session url - Sessions will be created when any client visit this url.
        new_session_url: "/session"
    }
};
// Load ServeMe
ServeMe = ServeMe(options, port);

var user     = "bear",
    password = "drowssap";


ServeMe.on("new_session", function(session)
{
    // Will be called each new session petition reaches.
    ServeMe.log("\nNew user...");

    // if user is correct & password too
    if(user == session.data.user && password == session.data.password)
    {
        ServeMe.log("  "+user+" has logged in.\n");
        return "logged in";// return true or a string to accept the new session
        //The string returned will be the response data.
    }
    // else return false (or nothing)
    ServeMe.log("  Couldn´t log in.\n");
    return false;
});
/**A session will be created visiting that url:
 * Name: 'bear'
 * Password: 'drowssap'
 * localhost:3000/session?user=bear&password=drowssap
 *
 * If you look then the console, you can see how 'bear' has logged in.
 */

ServeMe.on("session", function(session)
{
    // Will be called each existing session enters.

    // If you recharge the webpage before, this message will be printed.
    ServeMe.log("\n  "+session.data.user+" entered again!");
});

// Start the server
ServeMe.start(port);
