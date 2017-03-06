/**
 * PingService
 *
 * @author Steven T Hanna (http://www.github.com/steventhanna)
 * @description :: Since Ping will not use a controller, most of the implementation will be here
 *
 */

var request = require('request');

module.exports = {

  new: function(obj, callback) {
    Ping.create(obj).exec(funtion(err, ping) {
      if (err || ping == undefined) {
        console.log("There was an error creating the ping.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        callback();
      }
    });
  },

  sendPing: function(monitorID, cb) {
    var monitor;
    var pingObj = {};
    async.series([
      function(callback) {
        Monitor.findOne({
          id: monitorID
        }).exec(function(err, mon) {
          if (err || mon == undefined) {
            console.log("There was an error finding the monitor.");
            console.log("Error = " + err);
            res.serverError();
          } else {
            monitor = mon;
            callback();
          }
        });
      },
      function(callback) {
        request.get({
          url: monitor.targetURL,
          time: true,
          timeout: 20000
        }, function(err, response) {
          if (err || response == undefined) {
            console.log("Handle this");
          } else {
            pingObj.elapsedTime = response.elapsedTime;
            pingObj.status = response.statusCode;
            pingObj.targetURL = monitor.targetURL;
            callback();
          }
        });
      },
      function(callback) {
        PingService.new(pingObj, function() {
          callback();
        });
      },
      function(callback) {
        MonitorService.updateAverage(monitor, pingObj, function() {
          callback();
        });
      }
    ], function(callback) {
      cb();
    });
  }

}
