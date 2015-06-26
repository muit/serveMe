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
    log: true,

    cluster: {
        //Enabling clustering
        enabled: true,

        cpus: "max", //(Optional, Default: "max") Number of cpus of the cluster
        auto_reload: true //(Optional, Default: true) Set it to true to reload cluster workers if died
    }
};

//ATENTION: Cluster functionality stills in development. Its stability is limited.

//Start the Server
var serveMe = ServeMe(options, port);
serveMe.start();

//Route example
serveMe.routes.get("/hello", function() {
    return "hello world!";
});