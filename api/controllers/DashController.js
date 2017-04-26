/**
 * DashController
 *
 * @description :: Server-side logic for managing the dashbaord
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // Render the dashboard view
  dashboard: function(req, res) {
    User.findOne({
      id: req.user.id
    }).populateAll().exec(function(err, user) {
      if (err || user == undefined) {
        console.log("There was an error finding the user.");
        console.log("Error = " + error);
        res.serverError();
      } else {
        var dash;
        var monitors;
        async.series([
          function(callback) {
            DashService.getDashElement(function(elem) {
              dash = elem;
              callback();
            });
          },
          function(callback) {
            Monitor.find({
              sort: {
                createdAt: -1
              }
            }).exec(function(err, mon) {
              if (err || mon == undefined) {
                console.log("There was an error finding the monitors.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                monitors = mon;
                callback();
              }
            });
          },
          function(callback) {
            async.each(monitors, function(monitor, cb) {
              PingService.getMonitoredPings(monitor, function(pings) {
                monitor.monitoredPings = pings;
                cb();
              });
            }, function(err) {
              if (err) {
                console.log("There was an error finding the pings.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                callback();
              }
            });
          }
        ], function(callback) {
          DashService.title("Dashboard", function(title) {
            res.view('dash/dashboard', {
              user: user,
              dash: dash,
              title: title,
              currentPage: "dashboard",
              monitors: monitors,
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
            });
          });
        });
      }
    });
  },

  integrations: function(req, res) {
    User.findOne({
      id: req.user.id
    }).populateAll().exec(function(err, user) {
      if (err || user == undefined) {
        console.log("There was an error finding the user.");
        console.log("Error = " + error);
        res.serverError();
      } else {
        var dash;
        var integrations;
        var monitors;
        async.series([
          function(callback) {
            DashService.getDashElement(function(elem) {
              dash = elem;
              callback();
            });
          },
          function(callback) {
            Integration.find().exec(function(err, ints) {
              if (err || ints == undefined) {
                console.log("There was an error finding the integrations.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                integrations = ints;
                callback();
              }
            });
          },
          function(callback) {
            Monitor.find().exec(function(err, mons) {
              if (err || mons == undefined) {
                console.log("There was an error finding the monitors.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                monitors = mons;
                callback();
              }
            });
          },
          function(callback) {
            async.each(integrations, function(integration, cb) {
              Monitor.find({
                id: integration.monitors
              }).exec(function(err, ints) {
                if (err || ints == undefined) {
                  console.log("There was an error finding the monitors.");
                  console.log("Error = " + err);
                  res.serverError();
                } else {
                  integration.foundMonitor = ints;
                  cb();
                }
              });
            }, function(err) {
              if (err) {
                console.log("There was an error getting the monitors integrations.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                callback();
              }
            });
          },
        ], function(callback) {
          DashService.title("Integrations", function(title) {
            res.view('dash/integrations', {
              user: user,
              title: title,
              dash: dash,
              currentPage: "integrations",
              integrations: integrations,
              monitors: monitors
            });
          });
        });
      }
    });
  },

  // Edit the dash object
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
        var dash;
        var changes = false;
        var message = "";
        async.series([
          function(callback) {
            DashService.getDashElement(function(elem) {
              dash = elem;
              callback();
            });
          },
          function(callback) {
            if (post.name != undefined && post.name != dash.name) {
              dash.name = post.name;
              changes = true;
            }
            if (post.signupkey != undefined && post.signupkey != dash.signupkey) {
              dash.signupkey = post.signupkey;
              changes = true;
            }
            if (post.frontend != undefined && post.frontend != dash.frontend) {
              dash.frontend = post.frontend;
              changes = true;
            }
            if (post.trackingCode != undefined && post.trackingCode != dash.trackingCode) {
              dash.trackingCode = post.trackingCode;
              changes = true;
            }
            callback();
          },
          function(callback) {
            if (changes) {
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
              message = "No changes made";
              callback();
            }
          }
        ], function(callback) {
          res.send({
            success: true,
            message: message
          });
        });
      }
    });
  },

  settings: function(req, res) {
    User.findOne({
      id: req.user.id
    }).populateAll().exec(function(err, user) {
      if (err || user == undefined) {
        console.log("There was an error finding the user.");
        console.log("Error = " + error);
        res.serverError();
      } else {
        var dash;
        async.series([
          function(callback) {
            DashService.getDashElement(function(elem) {
              dash = elem;
              callback();
            });
          },
        ], function(callback) {
          DashService.title("Settings", function(title) {
            res.view('dash/settings', {
              currentPage: 'settings',
              title: title,
              user: user,
              dash: dash
            });
          });
        });
      }
    });
  },

  monitors: function(req, res) {
    User.findOne({
      id: req.user.id
    }).populateAll().exec(function(err, user) {
      if (err || user == undefined) {
        console.log("There was an error finding the user.");
        console.log("Error = " + error);
        res.serverError();
      } else {
        var dash;
        var monitors = [];
        async.series([
          function(callback) {
            DashService.getDashElement(function(elem) {
              dash = elem;
              callback();
            });
          },
          function(callback) {
            Monitor.find({
              id: dash.monitors
            }).exec(function(err, mons) {
              if (err || mons == undefined) {
                console.log("There was an error finding the monitors.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                monitors = mons;
                callback();
              }
            });
          }
        ], function(callback) {
          DashService.title("Monitors", function(title) {
            res.view('dash/monitors', {
              currentPage: 'monitors',
              title: title,
              user: user,
              dash: dash,
              monitors: monitors
            });
          });
        });
      }
    });
  },

  viewMonitor: function(req, res) {
    req.validate({
      monitorID: 'string'
    });
    User.findOne({
      id: req.user.id
    }).populateAll().exec(function(err, user) {
      if (err || user == undefined) {
        console.log("There was an error finding the user.");
        console.log("Error = " + error);
        res.serverError();
      } else {
        var monitor;
        var dash;
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
            DashService.getDashElement(function(elem) {
              dash = elem;
              callback();
            });
          },
        ], function(callback) {
          DashService.title(monitor.name, function(title) {
            res.view('dash/viewMonitor', {
              user: user,
              title: title,
              currentPage: "monitors",
              dash: dash,
              monitor: monitor
            });
          });
        });
      }
    });
  },

  subscribe: function(req, res) {
    if (!req.isSocket) {
      req.badRequest();
    } else {
      var monitors;
      var pingData = [];
      async.series([
        function(callback) {
          Monitor.find({
            sort: {
              createdAt: -1
            }
          }).exec(function(err, mon) {
            if (err || mon == undefined) {
              console.log("There was an error finding the monitor.");
              console.log("Error = " + err);
              res.serverError();
            } else {
              monitors = mon;
              callback();
            }
          });
        },
        function(callback) {
          async.each(monitors, function(monitor, cb) {
            sails.sockets.join(req, monitor.id, function(err) {
              if (err) {
                console.log("There was an error subscribing to the monitors.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                cb();
              }
            });
          }, function(err) {
            if (err) {
              console.log("There was an error subscribing to the monitors.");
              console.log("Error = " + err);
              res.serverError();
            } else {
              callback();
            }
          });
        },
        function(callback) {
          async.each(monitors, function(monitor, cb) {
            PingService.formatPingsChart(monitor, function(pings) {
              var obj = {
                name: monitor.name,
                pings: pings
              }
              pingData.push(obj);
              cb();
            });
          }, function(err) {
            if (err) {
              console.log("There was an error getting the pings.");
              console.log("Error = " + err);
              res.serverError();
            } else {
              callback();
            }
          });
        },
      ], function(callback) {
        res.send({
          pingData: pingData
        });
      });
    }
  },

  viewIntegration: function(req, res) {
    req.validate({
      integrationID: 'string'
    });
    User.findOne({
      id: req.user.id
    }).populateAll().exec(function(err, user) {
      if (err || user == undefined) {
        console.log("There was an error finding the user.");
        console.log("Error = " + error);
        res.serverError();
      } else {
        var dash;
        var integration;
        var monitors;
        async.series([
          function(callback) {
            Integration.findOne({
              id: req.param('integrationID')
            }).exec(function(err, int) {
              if (err || int == undefined) {
                console.log("There was an error finding the integration.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                integration = int;
                callback();
              }
            });
          },
          function(callback) {
            // Get the monitors specific to the integration
            integration.foundMonitors = [];
            async.each(integration.monitors, function(monitorID, cb) {
              Monitor.findOne({
                id: monitorID
              }).exec(function(err, monitor) {
                if (err || monitor == undefined) {
                  console.log("There was an error finding the monitor.");
                  console.log("Error = " + err);
                  res.serverError();
                } else {
                  integration.foundMonitors.push(monitor);
                  cb();
                }
              });
            }, function(err) {
              if (err) {
                console.log("There was an error getting the specific monitors for an integration.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                callback();
              }
            });
          },
          function(callback) {
            Monitor.find().exec(function(err, mons) {
              if (err || mons == undefined) {
                console.log("There was an error finding the monitors.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                monitors = mons;
                callback();
              }
            });
          },
          function(callback) {
            DashService.getDashElement(function(elem) {
              dash = elem;
              callback();
            });
          }
        ], function(callback) {
          DashService.title(integration.name, function(title) {
            res.view('dash/viewIntegration', {
              user: user,
              dash: dash,
              title: title,
              currentPage: 'integrations',
              monitors: monitors,
              integration: integration
            });
          });
        });
      }
    });
  },
};
