/**
 * MonitorController
 *
 * @description :: Server-side logic for managing monitors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  new: function(req, res) {
    var post = req.body;
    User.findOne({
      id: req.user.id
    }).populateAll().exec(function(err, user) {
      if (err || user == undefined) {
        console.log("There was an error finding the user.");
        console.log("Error = " + error);
        res.serverError();
      } else {
        var monitor;
        var monitorObject = {
          name: post.name,
          targetURL: post.targetURL,
          frequency: post.frequency,
          notificationSettings: [],
          currentHealth: "Healthy",
          averageResponseTime: 0,
          numberOfRequestsSent: 0,
          canPing: true,
          healthyRange: post.healthyRange,
          rockyRange: post.rockyRange,
          movingAverageWindow: post.movingAverageWindow
        };

        async.series([
          // Verify url
          function(callback) {
            if (UtilityService.validateURL(monitorObject.targetURL) == false) {
              res.send({
                success: false,
                message: "Not a valid target URL"
              });
            } else {
              callback();
            }
          },
          function(callback) {
            Monitor.create(monitorObject).exec(function(err, mon) {
              if (err || mon == undefined) {
                console.log("There was an error creating the monitor.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                monitor = mon;
                // Start the monitor
                MonitorService.schedulePing(monitor);
                callback();
              }
            });
          },
          function(callback) {
            DashService.addMonitor(monitor.id, function() {
              callback();
            });
          }
        ], function(callback) {
          User.subscribe(req, user, 'monitor');
          res.send({
            success: true
          });
        });
      }
    });
  },

  edit: function(req, res) {
    var post = req.body;
    User.findOne({
      id: req.user.id
    }).populateAll().exec(function(err, user) {
      if (err || user == undefined) {
        console.log("There was an error finding the user.");
        console.log("Error = " + error);
        res.serverError();
      } else {
        var monitor;
        var changes = false;
        async.series([
          function(callback) {
            Monitor.findOne({
              id: post.monitorID
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
            if (post.name != undefined && post.name != monitor.name) {
              monitor.name = post.name;
              changes = true;
            }
            if (post.targetURL != undefined && post.targetURL != monitor.targetURL && UtilityService.validateURL(post.targetURL)) {
              monitor.targetURL = post.targetURL;
              changes = true;
            } else {
              if (post.targetURL != monitor.targetURL) {
                res.send({
                  success: false,
                  message: "Not a valid URL"
                });
                return;
              }
            }
            if (post.frequency != undefined && post.frequency != monitor.frequency) {
              MonitorService.removePing(monitor);
              monitor.frequency = post.frequency;
              MonitorService.schedulePing(monitor);
              changes = true;
            }
            if (post.canPing != undefined) {
              monitor.canPing = post.canPing;
              if (monitor.canPing) {
                MonitorService.schedulePing(monitor);
              } else {
                MonitorService.removePing(monitor);
              }
              changes = true;
            }
            if (post.healthyRange != undefined && post.healthyRange != monitor.healthyRange) {
              monitor.healthyRange = post.healthyRange;
              changes = true;
            }
            if (post.rockyRange != undefined && post.rockyRange != monitor.rockyRange) {
              monitor.rockyRange = post.rockyRange;
              changes = true;
            }
            callback();
          },
          function(callback) {
            if (post.movingAverageWindow != undefined && post.movingAverageWindow != monitor.movingAverageWindow) {
              monitor.movingAverageWindow = post.movingAverageWindow;
              changes = true;
              // Recalculate the moving average
              MonitorService.calculateMovingAverage(monitor, function(mon) {
                monitor = mon;
                callback();
              });
            } else {
              callback();
            }
          },
          function(callback) {
            if (changes) {
              monitor.save(function(err) {
                if (err) {
                  console.log("There was an error saving the monitor.");
                  console.log("Error = " + err);
                  res.serverError();
                } else {
                  callback();
                }
              });
            } else {
              res.send({
                success: false,
                message: "No changes made."
              });
              return;
            }
          }
        ], function(callback) {
          res.send({
            success: true
          });
        });
      }
    });
  },

  subscribeToMonitor: function(req, res) {
    req.validate({
      monitorID: 'string'
    });

    if (!req.isSocket) {
      res.badRequest();
    } else {
      // Lookup the monitor to make sure it exists
      Monitor.findOne({
        id: req.param('monitorID')
      }).exec(function(err, monitor) {
        if (err || monitor == undefined) {
          console.log("There was an error finding the monitor.");
          console.log("Error = " + err);
          res.serverError();
        } else {
          sails.sockets.join(req, monitor.id, function(err) {
            if (err) {
              console.log("There was an error subscribing to the monitors room.");
              console.log("Error = " + err);
              res.serverError();
            } else {
              res.send({
                success: true
              });
            }
          });
        }
      });
    }
  },

};
