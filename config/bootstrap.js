/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  // Set up all the monitors, those that have state as true must have their crontabs added
  Monitor.find({
    where: {
      state: true
    }
  }).exec(function(err, monitors) {
    if (err || monitors == undefined) {
      console.log("There was an error finding the monitors.");
      console.log("Error = " + err);
    } else {
      async.each(monitors, function(monitor, callback) {
        MonitorService.schedulePing(monitor.id);
        callback();
      }, function(err) {
        if (err) {
          console.log("There was an error finishing the async.");
          console.log("Error = " + err);
        } else {
          cb();
        }
      });
    }
  });

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  // cb();
};
