module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy
  // or if this is the last policy, the controller
  if (req.isSocket) {
    return next();
  } else if (req.session == undefined || (req.user == undefined && req.passport == undefined)) {
    return res.redirect('/login');
  } else if (req.session.authenticated || req.user || req.isAuthenticated()) {
    return next();
  } else {
    console.log("We have a bit of a situation here...");
    return res.redirect('/login');
  }
}
