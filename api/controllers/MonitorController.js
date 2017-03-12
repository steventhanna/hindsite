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
          health: "Healthy",
          averageResponseTime: 0,
          numberOfRequestsSent: 0,
          state: true,
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
                MonitorService.schedulePing(monitor.id);
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
              MonitorService.schedulePing(monitor.id);
              changes = true;
            }
            if (post.canPing != undefined) {
              monitor.canPing = post.canPing;
              if (monitor.canPing) {
                MonitorService.schedulePing(monitor.id);
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
              MonitorService.calculateMovingAverage(monitor, function(err, mon) {
                if (err || monitor == undefined) {
                  console.log("There was an error calculating the moving average.");
                  console.log("Error = " + err);
                  res.serverError();
                } else {
                  monitor = mon;
                  callback();
                }
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
              sails.sockets.blast(monitor.id, monitor);
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
      var monitor;
      async.series([
        function(callback) {
          Monitor.findOne({
            id: req.param('monitorID')
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
      ], function(callback) {
        PingService.formatPingsChart(monitor, function(pings) {
          sails.sockets.join(req, monitor.id, function(err) {
            if (err) {
              console.log("There was an error subscribing to the monitors room.");
              console.log("Error = " + err);
              res.serverError();
            } else {
              res.send({
                pings: pings
              });
            }
          });
        });
      });
    }
  },

  subscribeToMonitors: function(req, res) {
    if (!req.isSocket) {
      req.badRequest();
    } else {
      DashService.getDashElement(function(elem) {
        async.each(elem.monitors, function(monitor, callback) {
          sails.sockets.join(req, monitor.id, function(err) {
            if (err) {
              console.log("There was an error subscribing to the monitors.");
              console.log("Error = " + err);
              res.serverError();
            } else {
              callback();
            }
          }, function(err) {
            if (err) {
              console.log("There was an error finishing the async each.");
              console.log("Error = " + err);
              res.serverError();
            } else {
              res.send({
                success: true
              });
            }
          });
        });
      });
    }
  },

  pings: function(req, res) {
    req.validate({
      monitorID: 'string'
    });
  },

  lastPing: function(req, res) {
    req.validate({
      monitorID: 'string'
    });
    var monitor;
    async.series([
      function(callback) {
        Monitor.findOne({
          id: req.param('monitorID')
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
    ], function(callback) {
      PingService.formatLastPing(monitor, function(ping) {
        res.send({
          ping: ping
        });
      });
    });
  },

};
