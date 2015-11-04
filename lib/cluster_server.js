'use strict';

var cluster = require('cluster');
var os = require('os');

module.exports = exports = ClusterServer;

var HttpServer = require('./http_server');

function ClusterServer(main, port, onStarted) {
  //Limit the cluster to the cpus amount
  if (main.config.cluster.cpus == "max" || main.config.cluster.cpus >= os.cpus().length) {
    main.config.cluster.cpus = os.cpus().length;
  }

  this.name = 'ServeMe.Cluster';
  this.start(main, port, onStarted);
};

ClusterServer.prototype.start = function(main, port, onStarted) {
  var self = this;

  if (cluster.isMaster) {
    for (var i = 0; i < main.config.cluster.cpus; i++) {
      cluster.fork();
    }

    cluster.on('death', function(worker) {
      // Log process deaths.
      main.impLog(self.name + '> worker ' + worker.pid + ' died.');

      // If autoRestart is true, spin up another to replace it
      if (main.config.cluster.auto_restart) {
        main.impLog(self.name + '> Restarting worker thread...');
        cluster.fork();
      }
    });

    cluster.on('fork', function(worker) {
      main.impLog(self.name + '> starting worker thread #' + worker.id);
    });

    //self.server = new HttpServer(main, port);
  } else {
    // Worker threads run the server
    self.server = new HttpServer(main, port, onStarted);
  }
};

ClusterServer.prototype.stop = function() {
  for (var id in cluster.workers) {
    cluster.workers[id].kill();
  }
};