'use strict';

var cluster = require('cluster');
var os = require('os');

module.exports = exports = ClusterServer;

var HttpServer = require('./http_server');

function ClusterServer(ServeMe, port){
    if (ServeMe.config.cluster.cpus == "max" || ServeMe.config.cluster.cpus >= os.cpus().length) 
        ServeMe.config.cluster.cpus = os.cpus().length;

    this.name = 'ServeMe.Cluster';
    this.start(ServeMe, port);
};

ClusterServer.prototype.start = function(ServeMe, port)
{
    var me = this, i;

    if (cluster.isMaster)
    { 
        for (var i = 0; i < ServeMe.config.cluster.cpus;  i++)
            cluster.fork();
        
        
        cluster.on('death', function (worker) {
            // Log deaths!
            ServeMe.log(me.name + ': worker ' + worker.pid + ' died.');
            
            // If autoRestart is true, spin up another to replace it
            if (ServeMe.config.cluster.auto_restart)
            {
                ServeMe.log(me.name + ': Restarting worker thread...');
                cluster.fork();
            }
        });

        cluster.on('fork', function(worker){
            ServeMe.log(me.name + ': starting worker thread #' + worker.id);
        });

        //me.server = new HttpServer(ServeMe, port);
    } else 
    {
        // Worker threads run the server
        me.server = new HttpServer(ServeMe, port);
    }
};

