/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

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
        // Update records
        var changes = false;
        var message = "";
        async.series([
          function(callback) {
            if (post.firstName != undefined && post.firstName != user.firstName) {
              user.firstName = post.firstName;
              user.fullName = user.firstName + " " + user.lastName;
              changes = true;
            }
            if (post.lastName != undefined && post.lastName != user.lastName) {
              user.lastName = post.lastName;
              user.fullName = user.firstName + " " + user.lastName;
              changes = true;
            }
            callback();
          },
          function(callback) {
            if (post.username != undefined && post.username != user.username) {
              // Check if that username already exists
              User.findOne({
                username: post.username
              }).exec(function(err, u) {
                if (err) {
                  console.log("There was an error finding a user with given username.");
                  console.log("Error = " + err);
                  res.serverError();
                } else if (u != undefined) {
                  message = "That username is already in use."
                  callback();
                } else {
                  user.username = post.username;
                  callback();
                }
              });
            } else {
              callback();
            }
          },
        ], function(callback) {
          if (changes) {
            user.save(function(err) {
              if (err) {
                console.log("There was an error saving the user.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                res.send({
                  success: true,
                  message: message
                });
              }
            });
          } else {
            res.send({
              success: false,
              message: "No changes made."
            })
          }
        });
      }
    });
  },

};
