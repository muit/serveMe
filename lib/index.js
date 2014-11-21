/**
 * Module dependencies.
 */
var HttpServer = require('./http_server');
var Routes = require("./routes");
var Session = require("./session");
var Config = require("./config");

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
    if (!(this instanceof ServeMe))
        return ServeMe.instance = new ServeMe(options, port);
    this.config = new Config(options);

    Session(this);

    this.port = port;
    this.server = null;
}

ServeMe.prototype =
{
    /**
     * Starts the server
     * @param  {Number} port [http server port]
     * @return {Object}      [server object]
     */
    start: function(port){
        return new HttpServer(this, port || this.port);
    },

    /**
     * Stops the server
     */
    stop: ServeMe.stop = function(){
        if(this.server)
            this.server.stop();
        this.Routes.reset("all");
        this.Session.reset();
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
        var event = this.events[identifier];
        if(typeof event == "function")
        {
            return event(data);
        }
        return undefined;
    },

    events: {},

    log: function(msg)
    {
        if(this.config && this.config.log !== false)
            console.log(msg);
    }
};
