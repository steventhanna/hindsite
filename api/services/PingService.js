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
    console.log("Creating a new ping");
    console.log(obj);
    Ping.create(obj).exec(function(err, ping) {
      if (err || ping == undefined) {
        console.log("There was an error creating the ping.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        callback();
      }
    });
  },

  sendPing: function(monitor, cb) {
    console.log("Sending a ping");
    var pingObj = {};
    async.series([
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
            pingObj.monitorID = monitor.id;
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
        MonitorService.calculateMovingAverage(monitor, function(mon) {
          mon.save(function(err) {
            if (err) {
              console.log("There was an error saving the monitor.");
              console.log("Error = " + err);
              res.serverError();
            } else {
              callback();
            }
          });
        });
      }
    ], function(callback) {
      cb();
    });
  },

  /**
   * Get the last ping object
   * @param :: monitorID - the monitor to get the last ID from
   * @param :: cb - the callback to pass through
   */
  getLastPing: function(monitorID, cb) {
    Ping.find({
      where: {
        monitorID: monitorID
      },
      sort: {
        createdAt: 1
      },
      limit: 1
    }).exec(function(err, pings) {
      if (err || pings == undefined) {
        console.log("There was an error finding the pings.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        if (pings.length == 0) {
          cb(undefined);
        } else {
          cb(pings[0]);
        }
      }
    });
  }
}
