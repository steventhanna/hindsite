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
            Dash.find().limit(1).exec(function(err, d) {
              if (err || d == undefined) {
                console.log("There was an error finding the dashboard.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                dash = d;
                callback();
              }
            });
          }
        ], function(callback) {
          res.view('dash/dashboard', {
            user: user,
            dash: dash,
            title: "Hindsite | Dashboard"
          });
        });
      }
    });
  },
};
