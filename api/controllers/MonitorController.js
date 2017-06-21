/**
 * MonitorController
 *
 * @description :: Server-side logic for managing monitors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var uuid = require('node-uuid');

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
          movingAverageWindow: post.movingAverageWindow,
          cronID: uuid.v1(),
          includeInFrontendReporting: post.includeFront
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
            if (post.frontendReporting != undefined && post.frontendReporting != monitor.includeInFrontendReporting) {
              monitor.includeInFrontendReporting = post.frontendReporting;
              changes = true;
            }
            if (post.targetURL != undefined && post.targetURL != monitor.targetURL) {
              if (!UtilityService.validateURL(post.targetURL)) {
                res.send({
                  success: false,
                  message: "Not a valid URL"
                });
                return;
              } else {
                monitor.targetURL = post.targetURL;
                changes = true;
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
            MonitorService.determineHealth(monitor, function() {
              callback();
            });
          },
          function(callback) {
            if (post.movingAverageWindow != undefined && post.movingAverageWindow != monitor.movingAverageWindow && post.movingAverageWindow != null) {
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
            }
          }
        ], function(callback) {
          sails.sockets.blast(monitor.id, monitor);
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
        PingService.formatPingsChart(monitor, function(err, pings, failedAmount) {
          if (err) {
            console.log("There was an error formating the pings.");
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
                  pings: pings,
                  amountOfFailedPings: failedAmount
                });
              }
            });
          }
        });
      });
    }
  },

  subscribeToMonitors: function(req, res) {
    if (!req.isSocket) {
      req.badRequest();
    } else {
      DashService.getDashElement(function(err, elem) {
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
    var failedPings;
    var splice = false;
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
      function(callback) {
        PingService.getMonitoredPings(monitor, function(err, pings) {
          if (err) {
            console.log("There was an error getting the pings.");
            console.log("Error = " + err);
            res.serverError();
          } else {
            splice = pings.length > monitor.movingAverageWindow;
            failedPings = pings.filter(function(p) {
              return p.status != "200" && p.status != "302";
            }).length;
            callback();
          }
        });
      }
    ], function(callback) {
      PingService.formatLastPing(monitor, function(ping) {
        res.send({
          ping: ping,
          amountOfFailedPings: failedPings,
          splice: splice
        });
      });
    });
  },

  state: function(req, res) {
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
            if (monitor.state == true) {
              monitor.state = false;
              monitor.health = "Offline";
              MonitorService.removePing(monitor);
            } else {
              monitor.state = true;
              monitor.health = "Online";
              MonitorService.schedulePing(monitor.id);
            }
            callback();
          },
          function(callback) {
            monitor.save(function(err) {
              if (err) {
                console.log("There was an error saving the monitor.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                callback();
              }
            });
          },
          function(callback) {
            // Update the socket
            sails.sockets.blast(monitor.id, monitor);
            DashService.blastDash();
            callback();
          },
        ], function(callback) {
          res.send({
            success: true
          });
        });
      }
    });
  },

  delete: function(req, res) {
    var post = req.body;
    User.findOne({
      id: req.user.id
    }).populateAll().exec(function(err, user) {
      if (err || user == undefined) {
        console.log("There was an error finding the user.");
        console.log("Error = " + error);
        res.serverError();
      } else {
        async.series([
          function(callback) {
            // Cancel any cron
            Monitor.findOne({
              id: post.monitorID
            }).exec(function(err, mon) {
              if (err || mon == undefined) {
                console.log("There was an error finding the monitor.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                MonitorService.removePing(mon);
                callback();
              }
            });
          },
          function(callback) {
            Monitor.destroy({
              id: post.monitorID
            }).exec(function(err) {
              if (err) {
                console.log("There was an error deleting the monitor.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                callback();
              }
            });
          },
          function(callback) {
            Ping.destroy({
              where: {
                monitorID: post.monitorID
              }
            }).exec(function(err) {
              if (err) {
                console.log("There was an error deleting the pings.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                callback();
              }
            });
          },
          function(callback) {
            // Look through all the integrations and remove the monitor
            Integration.find().exec(function(err, integrations) {
              if (err || integrations == undefined) {
                console.log("There was an error finding the integrations.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                async.each(integrations, function(integration, cb) {
                  var index = integration.monitors.indexOf(post.monitorID);
                  if (index > -1) {
                    integration.monitors.splice(index, 1);
                    integration.save(function(err) {
                      if (err) {
                        console.log("There was an error saving the integration.");
                        console.log("Error = " + err);
                        res.serverError();
                      } else {
                        cb();
                      }
                    });
                  } else {
                    cb();
                  }
                }, function(err) {
                  if (err) {
                    console.log("There was an error completing the async each.");
                    console.log("Error = " + err);
                    res.serverError();
                  } else {
                    callback();
                  }
                });
              }
            });
          },
          function(callback) {
            DashService.getDashElement(function(dash) {
              var index = dash.monitors.indexOf(post.monitorID);
              if (index > -1) {
                dash.monitors.splice(index, 1);
                dash.save(function(err) {
                  if (err) {
                    console.log("There was an error saving the dash.");
                    console.log("Error = " + err);
                    res.serverError();
                  } else {
                    callback();
                  }
                });
              } else {
                callback();
              }
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

};
