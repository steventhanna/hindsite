/**
 * IntegrationService
 *
 * @author Steven T Hanna (http://www.github.com/steventhanna)
 * @description :: Handle notifications and integrations
 *
 */

var request = require('request');
// var Slack = require('slack-node');

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
        // Send slack notification
        var stringBuilder = monitor.name + "'s health has changed to: " + monitor.health;
        IntegrationService.sendSlackNotification(stringBuilder, dash, function() {
          callback();
        });
      }
    ], function(callback) {
      cb();
    });
  },

  sendSlackNotification: function(message, dashObj, cb) {
    if (dashObj.slackWebhook == undefined || dashObj.slackWebhook == "") {
      cb();
    } else {
      var options = {
        uri: dashObj.slackWebhook,
        method: 'POST',
        json: {
          "text": message
        }
      };
      request.post(options, function(err, httpResponse, body) {
        if (err) {
          console.log("There was an error sending the slack message.");
          console.log("Error = " + err);
        } else {
          cb();
        }
      });
    }
  }



};
