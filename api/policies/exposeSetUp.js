// If the system has already been setup, restrict access to the set up page

module.exports = function(req, res, next) {
  Dash.findOne().exec(function(err, dash) {
    if (err || dash == undefined) {
      return next();
    } else {
      res.forbidden();
    }
  });
}
