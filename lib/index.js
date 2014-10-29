/**
 * Module dependencies.
 */
var HttpServer = require('./http_server');

/**
 * Module exports.
 */
module.exports = ServeMe;

/**
 * Server constructor.
 *
 * @param {Number} port
 * @param {Object} options
 * @api public
 */
function ServeMe(options, port){
  if (!(this instanceof ServeMe)) return new ServeMe(options, port);
  this.port = port;
  this.options = options;
}

ServeMe.prototype =
{
    start: function(port){
        this.server = new HttpServer(this.options, port || this.port);
        return this.server;
    },

    stop: function(){
        if(this.server)
            this.server.stop();
    }
};
