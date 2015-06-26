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
    log: false,
    session: {
        enabled: true,
        //OPTIONAL:
        //Session url - Sessions will be created when any client visit this url.
        new_session_url: "/login",
        global_path: true
    }
};
// Load ServeMe
var serveMe = ServeMe(options, port);

var username = "bear",
    password = "drowssap";


serveMe.on("new_session", function(evt) {
    var session = evt.session;
    // Will be called each new session petition reaches.
    serveMe.log("\nNew user...");
    serveMe.log(session.data);
    // if user is correct & password too
    if (username == session.data.username && password == session.data.password) {
        serveMe.log("  " + session.data.username + " has logged in.\n");
        return "Happy to see you " + session.data.username; // return true or a string to accept the new session
        //The string returned will be the response data.
    }
    // else return false (or nothing)
    serveMe.log("  Couldn't log in.\n");
    return false;
});
/**A session will be created visiting that url:
 * Name: 'bear'
 * Password: 'drowssap'
 * localhost:3000/session?user=bear&password=drowssap
 *
 * If you look then the console, you can see how 'bear' has logged in.
 */

serveMe.on("session", function(evt) {
    var session = evt.session;
    // Will be called each existing session enters.

    // If you recharge the webpage before, this message will be printed.
    serveMe.log("  " + session.data.username + " entered again!");
    return "Hi again, " + session.data.username;
});

// Start the server
serveMe.start(port);