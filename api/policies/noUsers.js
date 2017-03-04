// If there are no users, prompt to create one

module.exports = function(req, res, next) {
  User.find().exec(function(err, users) {
    if (err || users == undefined) {
      console.log("There was an error finding any users.");
      console.log("Error = " + err);
      res.serverError();
    } else if (users.length == 0) {
      return res.redirect('/setup/firstuser');
    } else {
      return next();
    }
  })
}
