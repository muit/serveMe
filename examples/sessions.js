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
        enabled: true
    }
};
//Load ServeMe
ServeMe = ServeMe(options, port);

//ATENTION: Actually working on it, may contain some bugs!

var user     = "bear",
    password = "drowssap";

ServeMe.on("new_session", function(session)
{
    ServeMe.log("New user...");

    //if user is correct & password too
    if(user == session.data.user && password == session.data.password)
    {
        ServeMe.log("  Loged In\n");
        return true;//return true to accept the new session.
    }

    ServeMe.log("  Couldn´t Log In\n");
    return false;
});
/**A session will be created visiting that url:
 * localhost:3000/session?user=bear&password=drowssap
 */

//Start the server
ServeMe.start();
