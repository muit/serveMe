'use strict';

var cluster = require('cluster');
var os = require('os');

module.exports = exports = ClusterServer;

var HttpServer = require('./http_server');

function ClusterServer(ServeMe, port){
    if (ServeMe.config.cluster.cpus == "max" || ServeMe.config.cluster.cpus > os.cpus().length) 
        ServeMe.config.cluster.cpus = os.cpus().length;

    this.name = 'ServeMe.Cluster';
    this.start(ServeMe, port);
};

ClusterServer.prototype.start = function(ServeMe, port)
{
    var me = this, i;

    if (cluster.isMaster)
     { 
        for (var i = 0; i < ServeMe.config.cluster.cpus;  i++) {
            console.log(me.name + ': starting worker thread #' + i);
            cluster.fork();
        }
        
        cluster.on('death', function (worker) {
            // Log deaths!
            console.log(me.name + ': worker ' + worker.pid + ' died.');
            // If autoRestart is true, spin up another to replace it
            if (ServeMe.config.cluster.auto_restart)
            {
                console.log(me.name + ': Restarting worker thread...');
                cluster.fork();
            }
        });
    } else {
        // Worker threads run the server
        me.server = new HttpServer(ServeMe, port);
    }
};