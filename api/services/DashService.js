/**
 * DashService
 *
 * @author Steven T Hanna (http://www.github.com/steventhanna)
 * @description :: Some functions to help with the managing Dash
 *
 */

module.exports = {
  getDashElement: function(callback) {
    Dash.find().limit(1).exec(function(err, dashs) {
      if (err || dashs == undefined) {
        console.log("There was an error finding the dash.");
        console.log("Error = " + err);
        callback(err, undefined)
      } else if (dashs.length == 0) {
        console.log("There was an error finding any dashs.");
        console.log("Error = " + err);
        callback(err, undefined);
      } else {
        // If not in production, do not send through the tracking code
        var elem = dashs[0];
        // elem.trackingCode = undefined;
        callback(null, elem);
      }
    });
  },

  title: function(titleString, callback) {
    DashService.getDashElement(function(err, elem) {
      callback(elem.name + " | " + titleString);
    });
  },

  getSignupKey: function(callback) {
    DashService.getDashElement(function(err, elem) {
      callback(elem.signupkey);
    });
  },

  /**
   * Add a monitor ID to the dash
   */
  addMonitor: function(id, cb) {
    var dash;
    async.series([
      function(callback) {
        DashService.getDashElement(function(err, elem) {
          dash = elem;
          callback();
        });
      },
      function(callback) {
        if (dash.monitors == undefined) {
          dash.monitors = [];
        }
        dash.monitors.unshift(id);
        dash.save(function(err) {
          if (err) {
            console.log("There was an error saving the dash element after adding a monitor.");
            console.log("Error = " + err);
            res.serverError();
          } else {
            callback();
          }
        });
      },
    ], function(callback) {
      cb();
    });
  },

  // Send a message to the sockets
  blastDash: function() {
    Monitor.find().exec(function(err, monitors) {
      if (err || monitors == undefined) {
        console.log("There was an error finding the monitors.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        var obj = {
          healthyMonitors: monitors.filter(function(x) {
            return x.health == "Healthy" && x.state;
          }),
          rockyMonitors: monitors.filter(function(x) {
            return x.health == "Rocky" && x.state;
          }),
          sickMonitors: monitors.filter(function(x) {
            return x.health == "Sick" && x.state;
          }),
          offlineMonitors: monitors.filter(function(x) {
            return x.state == false
          })
        };
        sails.sockets.blast("dashboard", obj);
      }
    });
  }
}
