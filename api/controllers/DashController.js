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
        async.series([
          function(callback) {
            DashService.getDashElement(function(elem) {
              dash = elem;
              callback();
            });
          }
        ], function(callback) {
          DashService.title("Dashboard", function(title) {
            res.view('dash/dashboard', {
              user: user,
              dash: dash,
              title: title,
              currentPage: "dashboard"
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
            if (post.twitterAPIKey != undefined && post.twitterAPIKey != dash.twitterAPIKey) {
              dash.twitterAPIKey = post.twitterAPIKey;
              changes = true;
            }
            if (post.postmarkAPIKey != undefined && post.slackAPIKey != dash.slackAPIKey) {
              dash.slackAPIKey = post.slackAPIKey;
              changes = true;
            }
            if (post.postmarkAPIKey != undefined && post.postmarkAPIKey != dash.postmarkAPIKey) {
              dash.postmarkAPIKey = post.postmarkAPIKey;
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
};
