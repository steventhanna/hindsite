/**
 * AuthController
 * @author Steven T Hanna (http://www.github.com/steventhanna)
 *
 * @description :: Server-side logic for managing most authentication procedure
 * Includes user creation, verification, and authentication
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');

module.exports = {

  login: function(req, res) {
    var user = req.body;
    passport.authenticate('local', function(err, user, info) {
      if (err || (!user)) {
        console.log("user = " + user);
        console.log("err = " + err);
        console.log("info = ");
        console.log(info);
        res.serverError();
      } else if ((!err) && user) {
        req.logIn(user, function(err) {
          if (err) {
            console.log("There was an error logging in the user.");
            console.log("Error = " + err);
            console.log(user);
            res.serverError();
            return;
          } else {
            res.send({
              user: user,
              success: true,
              status: 200
            });
          }
        });
      } else {
        res.serverError();
      }
    })(req, res);
  },

  logout: function(req, res) {
    req.logout();
    res.redirect('/');
  },

  signup: function(req, res) {
    var post = req.body;
    var userData = {
      username: post.email,
      password: post.password,
      firstName: post.firstName,
      lastName: post.lastName,
      fullName: post.firstName + " " + post.lastName,
    };

    var signupkey;
    var user;
    async.series([
      // Get the signup key
      function(callback) {
        DashService.getSignupKey(function(key) {
          signupkey = key;
          callback();
        });
      },
      // Verify the signup key
      function(callback) {
        if (post.signupkey != signupkey) {
          res.forbidden();
        } else {
          callback();
        }
      },
      // Check if the user already exists
      function(callback) {
        User.findOne({
          username: userData.username
        }).exec(function(err, u) {
          if (error || u != undefined) {
            res.serverError();
          } else {
            callback();
          }
        });
      },
      function(callback) {
        User.create(userData).exec(function(err, newUser) {
          if (err || newUser = undefined) {
            console.log("There was an error creating the new user.");
            console.log("Error = " + err);
            res.serverError();
          } else {
            // Log the user in
            user = newUser;
            callback();
          }
        })
      }
    ], function(callback) {
      req.logIn(user, function(err) {
        if (err) {
          res.serverError();
        } else {
          // Client side redirect
          res.send({
            success: true,
            user: user
          });
        }
      });
    });
  },

};
