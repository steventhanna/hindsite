/**
 * IncidentController
 *
 * @description :: Server-side logic for managing incidents
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
        var incidentObject = {
          status: post.status,
          title: post.title,
          messages: [],
          monitors: post.monitors
        };
        Incident.create(incidentObject).exec(function(err, incident) {
          if (err || incident == undefined) {
            console.log("There was an error creating the incident.");
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
        var incident;
        async.series([
          function(callback) {
            Incident.findOne({
              id: post.incidentID
            }).exec(function(err, incidentName) {
              if (err || incidentName == undefined) {
                console.log("There was an error finding the incident.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                incident = incidentName;
                callback();
              }
            });
          },
          function(callback) {
            var changes = false;
            if (post.title != undefined && post.title != incident.title) {
              incident.title = post.title;
              changes = true;
            }
            if (post.status != undefined && post.status != incident.status) {
              incident.status = post.status;
              changes = true;
            }
            if (post.monitors != undefined && post.monitors != incident.monitors) {
              incident.monitors = post.monitors;
              changes = true;
            }
            if (changes) {
              incident.save(function(err) {
                if (err) {
                  console.log("There was an error saving the incident.");
                  console.log("Error = " + err);
                  res.serverError();
                } else {
                  callback();
                }
              });
            } else {
              res.send({
                error: true,
                message: "Nothing edited."
              });
            }
          },
        ], function(callback) {
          res.send({
            success: true
          });
        });
      }
    });
  },

};
