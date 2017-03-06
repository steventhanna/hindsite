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
  },

  /**
   * Add a monitor ID to the dash
   */
  addMonitor: function(id, cb) {
    var dash;
    async.series([
      function(callback) {
        DashService.getDashElement(function(elem) {
          dash = elem;
          callback();
        });
      },
      function(callback) {
        if (dash.monitors == undefined) {
          dash.monitors = [];
        }
        dash.monitors.unshift(id);
        dash.save(function(err) {
          if (err) {
            console.log("There was an error saving the dash element after adding a monitor.");
            console.log("Error = " + err);
            res.serverError();
          } else {
            callback();
          }
        });
      },
    ], function(callback) {
      cb();
    });
  }
}
