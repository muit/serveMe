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
    home: "index.html",
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
ServeMe = ServeMe(options, port);
ServeMe.start();

//New session event
ServeMe.on("new_session", function()
{
    console.log("Hey! One more friend...");
    return true;
});

ServeMe.on("session", function()
{
    console.log("Oh! You again.");
});

ServeMe.on("end_session", function()
{
    console.log("Bye Bye My friend. ;(");
});