/**
 * MonitorController
 *
 * @description :: Server-side logic for managing monitors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  new: function(req, res) {
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
          notificationSettings: []
        };
        async.series([
          // Verify url
          function(callback) {
            if (UtilityService.verifyURL(monitorObject.targetURL) == false) {
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
              res.send({
                success: false,
                message: "Not a valid URL"
              });
            }
            if (post.frequency != undefined && post.frequency != monitor.frequency) {
              monitor.frequency = post.frequency;
              changes = true;
            }
            callback();
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
          res.send({
            success: true
          });
        });
      }
    });
  },

};
