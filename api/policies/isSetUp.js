// Determine if the system has been set up yet

module.exports = function(req, res, next) {

  Dash.findOne().exec(function(err, dash) {
    if (err) {
      console.log("There was an error finding the dash.");
      console.log("Error = " + err);
      res.serverError();
    } else if (dash == undefined) {
      console.log("The dashboard has not been setup yet");
      // Set up the dashboard here
      var dashObj = {
        endpoints: [],
        signupkey: 'hindsite'
      };
      Dash.create(dashObj).exec(function(err, dash) {
        if (err || dash == undefined) {
          console.log("There was an error creating the dashboard object.");
          console.log("Error = " + err);
          res.serverError();
        } else {
          return next();
        }
      });
    } else {
      return next();
    }
  });
}
