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
  if (!(this instanceof ServeMe)) return new ServeMe(port, options);
  this.port = port;
  this.options = options;
}

ServeMe.prototype =
{
    start: function(port){
        this.server = new HttpServer(port || this.port, this.options);
        return this.server;
    },

    stop: function(){
        if(this.server)
            this.server.stop();
    }
};
