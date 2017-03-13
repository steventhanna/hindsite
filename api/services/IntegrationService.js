/**
 * IntegrationService
 *
 * @author Steven T Hanna (http://www.github.com/steventhanna)
 * @description :: Handle notifications and integrations
 *
 */

var request = require('request');

module.exports = {

  sendNotifications: function(monitorID, cb) {
    var monitor;
    var dash;
    async.series([
      function(callback) {
        Monitor.findOne({
          id: monitorID
        }).exec(function(err, mon) {
          if (err || mon == undefined) {
            console.log("There was an error finding the monitor.");
            console.log("Error = " + err);
            res.serverError();
          } else {
            monitor = mon;
            callback();
          }
        });
      },
      function(callback) {
        DashService.getDashElement(function(elem) {
          dash = elem;
          callback();
        });
      },
      function(callback) {
        var stringBuilder = monitor.name + "'s health has changed to: " + monitor.health + ". It's average response time is: " + monitor.averageResponseTime + "ms";
        // Get all the integrations with an active state
        Integration.find({
          where: {
            state: true
          }
        }).exec(function(err, integrations) {
          if (err || integrations == undefined) {
            console.log("There was an error finding the integrations.");
            console.log("Error = " + err);
            res.serverError();
          } else {
            async.each(integrations, function(integration, callb) {
              if (integration.monitors.contains(monitor.id)) {
                IntegrationService.triggerIntegration(integration, stringBuilder, function() {
                  callb();
                });
              } else {
                clalb();
              }
            }, function(err) {
              if (err) {
                console.log("There was an error async eaching the integrations.");
                console.log("Error = " + err);
                res.serverError();
              } else {
                callback();
              }
            });
          }
        });
      }
    ], function(callback) {
      cb();
    });
  },


  triggerIntegration: function(integrationObj, message, cb) {
    var options = {
      uri: integrationObj.webhook,
      method: 'POST',
      json: {
        "value1": message
      }
    };
    request.post(options, function(err, response, body) {
      if (err) {
        console.log("There was an error triggering the webhook.");
        console.log("Error = " + err);
        res.serverError();
      } else {
        cb();
      }
    });
  },

};
