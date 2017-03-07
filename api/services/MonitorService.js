/**
 * MonitorService
 *
 * @author Steven T Hanna (http://www.github.com/steventhanna)
 * @description :: Setting and configuring the monitors and cron jobs
 *
 */

var cron = require('node-schedule');

module.exports = {

  schedulePing: function(monitorObj) {
    console.log("Scheduling a ping");
    // var scheduled = cron.scheduleJob({}, function() {
    //   console.log("CRON EXECUTE");
    // })
    console.log(monitorObj.frequency);
    // var scheduled = cron.scheduleJob(monitorObj.cronID, monitorObj.frequency, function() {
    //   console.log(scheduled);
    //   PingService.sendPing(monitorObj, function() {
    //     console.log("Inner schedule");
    //   });
    // });
    var scheduled = cron.scheduleJob(monitorObj.frequency, function() {
      console.log(scheduled);
      PingService.sendPing(monitorObj, function() {
        console.log("Inner schedule");
      });
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
   * Updates the average for the monitor, as well as monitor health
   * @param :: monitorObj - the object of the monitor, so it does not have to be looked up again
   * @param :: pingObj - the pingObj just recieved
   * @param :: callback - callback when completed
   */
  updateAverage: function(monitorObj, pingObj, callback) {
    // Multiply the old average by (n - 1), add the new number, and then divide the total by n
    var tempResponseTime = monitorObj.averageResponseTime;
    // Calculate lower bounds and upper bounds of the average time, to determine monitor health
    // if lower than average, or within 10% of upper bound of average, healthy
    var bound10 = (tempResponseTime + (tempResponseTime / 10));
    var bound20 = (tempResponseTime + (tempResponseTime / 20));
    var bound30 = (tempResponseTime + (tempResponseTime / 30));
    // The average is not right at all
    if (monitorObj.averageResponseTime > 0) {
      if (pingObj.elapsedTime < tempResponseTime || pingObj.elapsedTime < bound10) {
        monitorObj.currentHealth = "Healthy";
      }
      // Else if within 20% of bound,
      else if (pingObj.elapsedTime < bound20) {
        monitorObj.currentHealth = "Rocky";
      } else {
        monitorObj.currentHealth = "Sick";
      }

      if (pingObj.status != "200" || pingObj.status != "302") {
        monitorObj.currentHealth = "Sick";
      }
      var old = monitorObj.averageResponseTime * (monitorObj.numberOfRequestsSent - 1);
      monitorObj.numberOfRequestsSent++;
      var newNum = (old + pingObj.elapsedTime) / monitorObj.numberOfRequestsSent;
      monitorObj.averageResponseTime = newNum;
    } else {
      monitorObj.averageResponseTime = pingObj.elapsedTime;
      monitorObj.numberOfRequestsSent++;
      if (pingObj.status == "200" || pingObj.status == "302") {
        monitorObj.currentHealth = "Healthy";
      } else {
        monitorObj.currentHealth = "Sick";
      }
    }

    monitorObj.averageResponseTime = Math.ceil(monitorObj.averageResponseTime);

    monitorObj.save(function(err) {
      if (err) {
        console.log("There was an error saving the monitor object.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        console.log("Should have saved the monitor");
        console.log(monitorObj);
        callback();
      }
    });
  },

}
