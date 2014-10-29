if(typeof Utyl == "undefined") require("../lib/utyl/utyl.js");
var ServeMe = require('../..');

//*******************************
// HTTP SERVER
// Only server the html & other files
//*******************************
var port = 3000;
var options = {
    home: "index.html",
    directory: "./public",
    debug: false,
    secure: false
};

ServeMe = ServeMe(options, port);
ServeMe.start();
