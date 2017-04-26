// Determine if the system has been set up yet

module.exports = function(req, res, next) {
  Dash.find().limit(1).exec(function(err, dash) {
    if (err) {
      console.log("There was an error finding the dash.");
      console.log("Error = " + err);
      res.serverError();
    } else if (dash.length == 0) {
      console.log("The dashboard has not been setup yet");
      // Set up the dashboard here
      var dashObj = {
        monitors: [],
        signupkey: 'hindsite',
        name: 'Hindsite',
        frontend: false,
        trackingCode: "",
        timezone: '0'
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
