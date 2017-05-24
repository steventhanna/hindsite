/**
 * PingService
 *
 * @author Steven T Hanna (http://www.github.com/steventhanna)
 * @description :: Since Ping will not use a controller, most of the implementation will be here
 *
 */

var request = require('request');
var moment = require('moment');

module.exports = {

  new: function(obj, callback) {
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

  sendPing: function(monitorID, cb) {
    var pingObj = {};
    var monitor;
    async.series([
      function(callback) {
        Monitor.findOne({
          id: monitorID
        }).exec(function(err, mon) {
          if (err || mon == undefined) {
            console.log("There was an error finding the monitor.");
            console.log("Error = " + err);
            cb(err);
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
            pingObj.elapsedTime = parseInt(response.elapsedTime);
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
              console.log("ERROR Ping");
              cb(err);
            } else {
              callback();
            }
          });
        });
      },
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
        createdAt: -1
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
  },

  /**
   * Formats one ping into what it should be for a chart
   * @param :: pingObj - the object of the ping
   * @return :: obj - the newly formatted object
   */
  formatPing: function(pingObj) {
    if (pingObj != undefined) {
      var obj = {
        elapsedTime: pingObj.elapsedTime,
        createdAt: pingObj.createdAt
      };
      return obj;
    } else {
      return undefined;
    }
  },

  formatPingsChart: function(monitor, cb) {
    PingService.getMonitoredPings(monitor, function(pings) {
      var p = [];
      console.log(pings);
      async.each(pings, function(ping, callback) {
        p.push(PingService.formatPing(ping));
        callback();
      }, function(err) {
        if (err) {
          console.log("There was an error iterating over each ping.");
          console.log("Error = " + err);
          res.serverError();
        } else {
          cb(p);
        }
      });
    });
  },

  formatLastPing: function(monitor, cb) {
    PingService.getLastPing(monitor.id, function(ping) {
      cb(PingService.formatPing(ping));
    });
  },

  /**
   * Get the last x amount of pings, where x = monitor.movingAverageWindow
   * @param :: monitor - the monitor to get the pings
   * @param :: cb - the callback
   */
  getMonitoredPings: function(monitor, cb) {
    Ping.find({
      where: {
        monitorID: monitor.id
      },
      limit: monitor.movingAverageWindow,
      sort: {
        createdAt: -1
      }
    }).exec(function(err, pi) {
      if (err || pi == undefined) {
        console.log("There was an error finding the pings.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        cb(pi);
      }
    });
  },
}
