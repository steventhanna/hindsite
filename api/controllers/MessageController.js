/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
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
        var incident;
        var message;
        async.series([
          function(callback) {
            Incident.findOne({
              id: post.incidentID
            }).exec(function(err, inc) {
              if (err || inc == undefined) {
                console.log("There was an error finding the user.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                incident = inc;
                callback();
              }
            });
          },
          function(callback) {
            var messageObj = {
              title: post.title,
              body: post.body,
            };
            Message.create(messageObj).exec(function(err, mess) {
              if (err || mess == undefined) {
                console.log("There was an error creating the message.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                message = mess;
                callback();
              }
            });
          },
          function(callback) {
            if (incident.messages == undefined) {
              incident.messages = [];
            }
            incident.messages.unshift(message.id);
            incident.save(function(err) {
              if (err) {
                console.log("There was an error saving the incident.");
                console.log("Error = " + err);
                res.serverError();
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
        var message;
        async.series([
          function(callback) {
            Message.findOne({
              id: post.messageID
            }).exec(function(err, mess) {
              if (err || mess == undefined) {
                console.log("There was an error finding the message.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                message = mess;
                callback();
              }
            });
          },
          function(callback) {
            var changes = false;
            if (post.title != undefined && post.title != message.title) {
              message.title = true;
              changes = true;
            }
            if (post.body != undefined && post.body != message.body) {
              message.body = true;
              changes = true;
            }
            if (changes) {
              message.save(function(err) {
                if (err) {
                  console.log("There was an error saving the message.");
                  console.log("Error = " + err);
                  res.serverError();
                } else {
                  callback();
                }
              });
            } else {
              callback();
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
        var message;
        var incident;
        async.series([
          function(callback) {
            Incident.findOne({
              id: post.incidentID
            }).exec(function(err, inc) {
              if (err || inc == undefined) {
                console.log("There was an error finding the incident.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                incident = inc;
                callback();
              }
            });
          },
          function(callback) {
            if (incident.messages != undefined) {
              var index = incident.messages.indexOf(post.messageID);
              incident.messages.splice(index, 1);
            } else {
              incident.messages = [];
            }
            incident.save(function(err) {
              if (err) {
                console.log("There was an error saving the incident.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                callback();
              }
            });
          },
          function(callback) {
            Message.destroy({
              id: post.messageID
            }).exec(function(err) {
              if (err) {
                console.log("There was an error destroying the message.");
                console.log("Error = " + err);
                res.serverError();
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
