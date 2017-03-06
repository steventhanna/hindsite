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
    var scheduled = cron.scheduleJob(monitorObj.cronID, monitorObj.frequency, function() {
      PingService.sendPing(monitorObj, function() {

      });
    });
  },

  /**
   * Removes the cron job sending pings
   * @param :: monitorObj - the monitor object associated
   */
  removePing: function(monitorObj) {
    var scheduled = cron.scheduledJobs[monitorObj.cronID];
    scheduled.cancel();
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
    if (pingObj.elapsedTime < tempResponseTime || pingObj.elaspedTime < bound10) {
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

    var old = monitorObj.averageResponseTime * (numberOfRequestsSent - 1);
    monitorObj.numberOfRequestsSent += 1;
    var newNum = (old + pingObj.elapsedTime) / monitorObj.numberOfRequestsSent;

    monitorObj.save(function(err) {
      if (err) {
        console.log("There was an error saving the monitor object.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        callback();
      }
    });
  },

}
