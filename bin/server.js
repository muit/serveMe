if(typeof Utyl == "undefined") require("../source/utyl/utyl.js");
http = require("../source/http_server.js");

//*******************************
// HTTP SERVER
// Only server the html & other files
//*******************************
var port = 3000;
var options = {
    home: "index.html",
    debug: false,
    secure: false
}

httpServer = http.start(port, options);