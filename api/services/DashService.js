/**
 * DashService
 *
 * @author Steven T Hanna (http://www.github.com/steventhanna)
 * @description :: Some functions to help with the managing Dash
 *
 */

module.exports = {
  getDashElement: function(callback) {
    Dash.find().limit(1).exec(function(err, dashs) {
      if (err || dashs == undefined) {
        console.log("There was an error finding the dash.");
        console.log("Error = " + err);
        res.serverError();
      } else if (dashs.length == 0) {
        console.log("There was an error finding any dashs.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        callback(dashs[0]);
        // return dashs[0];
      }
    });
  },

  title: function(titleString, callback) {
    DashService.getDashElement(function(elem) {
      callback(elem.name + " | " + titleString);
    });
  },

  getSignupKey: function(callback) {
    DashService.getDashElement(function(elem) {
      callback(elem.signupkey);
    });
  }
}
