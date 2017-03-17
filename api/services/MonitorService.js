/**
 * MonitorService
 *
 * @author Steven T Hanna (http://www.github.com/steventhanna)
 * @description :: Setting and configuring the monitors and cron jobs
 *
 */

var cron = require('node-schedule');

module.exports = {

  schedulePing: function(monitorID) {
    Monitor.findOne({
      id: monitorID
    }).exec(function(err, monitor) {
      if (err) {
        console.log("There was an error finding the monitor.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        var scheduled = cron.scheduleJob(monitor.cronID, monitor.frequency, function() {
          PingService.sendPing(monitor.id, function(err) {
            if (err) {
              console.log("There was an error sending the ping.");
              console.log("Error = " + err);
            }
          });
        });
      }
    });
  },

  /**
   * Removes the cron job sending pings
   * @param :: monitorObj - the monitor object associated
   */
  removePing: function(monitorObj) {
    var scheduled = cron.scheduledJobs[monitorObj.cronID];
    if (scheduled != undefined) {
      scheduled.cancel();
    } else {
      console.log("Failed to cancel");
    }
  },

  /**
   * Calculate the moving average based on the most recent pings
   * @param :: monitor - the current monitor
   * @param :: cb - the callback that contains the updated monitor
   */
  calculateMovingAverage: function(monitor, cb) {
    var pings;
    var total = 0;
    async.series([
      function(callback) {
        // Get the latest amount of pings
        PingService.getMonitoredPings(monitor, function(elem) {
          pings = elem;
          callback();
        });
      },
      function(callback) {
        async.each(pings, function(p, call) {
          total += parseInt(p.elapsedTime);
          call();
        }, function(err) {
          if (err) {
            console.log("There was an error adding everything up.");
            console.log("Error = " + err);
            res.serverError();
          } else {
            callback();
          }
        });
      },
      function(callback) {
        monitor.averageResponseTime = total / pings.length;
        monitor.averageResponseTime = Math.ceil(monitor.averageResponseTime);
        callback();
      },
      function(callback) {
        MonitorService.determineHealth(monitor, function(err, mon) {
          if (err || mon == undefined) {
            console.log("There was an error saving the monitor.");
            console.log("Error = " + err);
            // res.serverError();
            callback();
          } else {
            monitor = mon;
            callback();
          }
        });
      }
    ], function(callback) {
      sails.sockets.blast(monitor.id, monitor);
      cb(monitor);
    });
  },

  /**
   * Determine the health of the given monitor based on the average
   * @param :: monitor - the monitor to analyze, sends the monitor object back
   */
  determineHealth: function(monitor, cb) {
    var lastPing;
    var change = false;
    async.series([
      function(callback) {
        PingService.getLastPing(monitor.id, function(elem) {
          lastPing = elem;
          callback();
        });
      },
      function(callback) {
        var current = monitor.health;
        if (lastPing != undefined) {
          if (lastPing.status != "200" && lastPing.status != "302") {
            monitor.health = "Sick";
            change = current != monitor.health;
            callback();
          } else {
            if (monitor.averageResponseTime < monitor.healthyRange) {
              monitor.health = "Healthy";
            } else if (monitor.averageResponseTime < monitor.rockyRange) {
              monitor.health = "Rocky";
            } else {
              monitor.health = "Sick";
            }
            change = current != monitor.health;
            callback();
          }
        } else {
          console.log("The last ping was undefined... Possible that there was no last ping");
          callback();
        }
      },
      function(callback) {
        monitor.save(function(err) {
          if (err) {
            console.log("There was an error saving the monitor.");
            console.log("Error = " + err);
            cb(err, undefined)
          } else {
            DashService.blastDash();
            callback();
          }
        });
      },
      function(callback) {
        if (change == true) {
          IntegrationService.sendNotifications(monitor.id, function() {
            callback();
          });
        } else {
          callback();
        }
      }
    ], function(callback) {
      cb(undefined, monitor);
    });
  },
}
