module.exports = exports = ClusterServer;

var HttpServer = require('./http_server');

function ClusterServer(ServeMe, port){
    'use strict';
    
    var cluster = require('cluster'),
        os = require('os');

    var Cluster = {
        name: "ServeMe.Cluster",

        cpus: os.cpus().length,
        
        autoRestart: true, // Restart threads on death?
        
        start: function (ServeMe, port) {
            var me = this, i;
            
            if (cluster.isMaster) { // fork worker threads
                for (i = 0; i < me.cpus; i += 1) {
                    console.log(me.name + ': starting worker thread #' + i);
                    cluster.fork();
                }
                
                cluster.on('death', function (worker) {
                    // Log deaths!
                    console.log(me.name + ': worker ' + worker.pid + ' died.');
                    // If autoRestart is true, spin up another to replace it
                    if (me.autoRestart) {
                        console.log(me.name + ': Restarting worker thread...');
                        cluster.fork();
                    }
                });
            } else {
                // Worker threads run the server
                console.log(me.server);
                me.server = new HttpServer(ServeMe, port);
                console.log(me.server);
            }
        }
    };
    
    if (ServeMe.config.cluster.cpus == "max" || ServeMe.config.cluster.cpus > os.cpus().length) 
        Cluster.cpus = os.cpus().length;
    else
        Cluster.cpus = ServeMe.config.cluster.cpus;

    Cluster.name = 'ServeMe.Cluster';
    Cluster.start(ServeMe, port);
};
