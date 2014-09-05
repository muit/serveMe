if(!Utyl) require("../source/utyl/utyl.js");
http = require("../source/http_server.js");

//*******************************
// HTTP SERVER
// Only server the html & other files
//*******************************

httpServer = http.start(3000, {debug: true, secure: false});