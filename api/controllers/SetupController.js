/**
 * SetupController
 *
 * @description :: Handle the setup process
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // Create the dash element
  create: function(req, res) {
    // At this point a user should be created and logged in
    User.findOne({
      id: req.user.id
    }).exec(function(err, user) {
      if (err || user == undefined) {
        console.log("There was an error finding the user.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        var dashObj = {
          endpoints: []
        };
        Dash.create(dashObj).exec(function(err, dash) {
          if (err || dash == undefined) {
            console.log("There was an error creating the dashboard object.");
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

  // Render the view for create
  createView: function(req, res) {
    User.findOne({
      id: req.user.id
    }).exec(function(err, user) {
      if (err || user == undefined) {
        console.log("There was an error fiding the user.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        DashService.title("Create", function(title) {
          res.view('setup/create', {
            user: user,
            title: title
          });
        })
      }
    });
  },

  // Render the view so users can signup
  signupView: function(req, res) {
    if (req.user != undefined) {
      res.redirect('/dashboard');
    } else {
      DashService.title("Signup", function(title) {
        res.view('setup/signup', {
          title: title
        });
      });
    }
  },

  // Render the view so users can login
  loginView: function(req, res) {
    if (req.user != undefined) {
      res.redirect('/dashboard');
    } else {
      DashService.title("Login", function(title) {
        res.view('setup/login', {
          title: title
        });
      });
    }
  },
};
