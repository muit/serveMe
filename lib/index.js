/**
 * Module dependencies.
 */
var HttpServer = require('./http_server');
var Routes = require("./routes");
var Session = require("./session.js");

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

    Session((options)? options.session : undefined);

    this.port = port;
    this.options = options;
}

ServeMe.prototype =
{
    /**
     * Starts the server
     * @param  {Number} port [http server port]
     * @return {Object}      [server object]
     */
    start: function(port){
        this.server = new HttpServer(this, port || this.port);
        this.server.routes = Routes;
        return this.server;
    },

    /**
     * Stops the server
     */
    stop: ServeMe.stop = function(){
        if(this.server)
            this.server.stop();
    },

    //Routes
    Routes: ServeMe.Routes = Routes,

    //Session
    Session: ServeMe.Session = Session,

    /**
     * On Event
     * @param  {String}   identifier [name of the event]
     * @param  {Function} callback   [method called when event is active]
     */
    on: function(identifier, callback)
    {
        this.events[identifier] = callback;
    },

    /**
     * Call Event
     * @param  {String} identifier [name of the event]
     */
    call: function(identifier, data)
    {
        if(typeof this.events[identifier] == "function")
        {
            this.events[identifier](data);
            return true;
        }
        return false;
    },

    events: {}
};
