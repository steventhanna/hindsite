/**
 * IntegrationController
 *
 * @description :: Server-side logic for managing integrations
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
        var postObj = {
          name: post.name,
          webhook: post.webhook,
          state: true,
          monitors: post.monitors
        };
        Integration.create(postObj).exec(function(err, integration) {
          if (err || postObj == undefined) {
            console.log("There was an error creating the integration.");
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
        var integration;
        var changes = false;
        async.series([
          function(callback) {
            Integration.findOne({
              id: post.integrationID
            }).exec(function(err, integ) {
              if (err || integ == undefined) {
                console.log("There was an error finding the integration.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                integration = integ;
                callback();
              }
            });
          },
          function(callback) {
            if (post.name != undefined && post.name != integration.name) {
              integration.name = post.name;
              changes = true;
            }
            if (post.webhook != undefined && post.webhook != integration.webhook) {
              integration.webhook = post.webhook;
              changes = true;
            }
            if (post.monitors == undefined) {
              integration.monitors = [];
              changes = true;
            } else {
              integration.monitors = post.monitors;
              changes = true;
            }
            callback();
          },
          function(callback) {
            if (changes == true) {
              integration.save(function(err) {
                if (err) {
                  console.log("There was an error saving the integration.");
                  console.log("Error = " + err);
                  res.serverError();
                } else {
                  callback();
                }
              });
            } else {
              callback();
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
        Integration.destroy({
          id: post.integrationID
        }).exec(function(err) {
          if (err) {
            console.log("There was an error destroying the integration.");
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
  },

};
