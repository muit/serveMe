'use strict';

var cluster = require('cluster');
var os = require('os');

module.exports = exports = ClusterServer;

var HttpServer = require('./http_server');

function ClusterServer(ServeMe, port) {
  //Limit the cluster to the cpus amount
  if (ServeMe.config.cluster.cpus == "max" || ServeMe.config.cluster.cpus >= os.cpus().length) {
    ServeMe.config.cluster.cpus = os.cpus().length;
  }

  this.name = 'ServeMe.Cluster';
  this.start(ServeMe, port);
};

ClusterServer.prototype.start = function(ServeMe, port) {
  var self = this;

  if (cluster.isMaster) {
    for (var i = 0; i < ServeMe.config.cluster.cpus; i++) {
      cluster.fork();
    }

    cluster.on('death', function(worker) {
      // Log process deaths.
      ServeMe.impLog(self.name + ': worker ' + worker.pid + ' died.');

      // If autoRestart is true, spin up another to replace it
      if (ServeMe.config.cluster.auto_restart) {
        ServeMe.impLog(self.name + ': Restarting worker thread...');
        cluster.fork();
      }
    });

    cluster.on('fork', function(worker) {
      ServeMe.impLog(self.name + ': starting worker thread #' + worker.id);
    });

    //self.server = new HttpServer(ServeMe, port);
  } else {
    // Worker threads run the server
    self.server = new HttpServer(ServeMe, port);
  }
};

ClusterServer.prototype.stop = function() {
  for (var id in cluster.workers) {
    cluster.workers[id].kill();
  }
};