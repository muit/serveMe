/*************************
 *Clustering Example
 *************************/

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
    log: false,

    cluster: {
        //Enabling clustering
        enabled: true,

        cpus: "max", //(Optional, Default: "max") Number of cpus of the cluster
        auto_reload: true //(Optional, Default: true) Set it to true to reload cluster workers if died
    },

    session: {
        enabled: true,
        //OPTIONAL:
        //Session url - Sessions will be created when any client visit this url.
        new_session_url: "/"
    }
};

//ATENTION: Cluster functionality stills in development. Its stability is limited.

//Start the Server
var serveMe = ServeMe(options, port);
serveMe.start();

//New session event
serveMe.on("new_session", function() {
    console.log("Hey! One more friend...");
    return true;
});

serveMe.on("session", function() {
    console.log("Oh! You again.");
});

serveMe.on("end_session", function() {
    console.log("Bye Bye My friend. ;(");
});