/**
 * IntegrationService
 *
 * @author Steven T Hanna (http://www.github.com/steventhanna)
 * @description :: Handle getting messages and converting the Markdown to HTML
 *
 */

var marked = require('marked');

module.exports = {

  /**
   * Retrieve and convert a single message into ready markdown ready for the page
   * @param :: messageID - the id of the message to lookup
   * @param :: callback - callback(err, renderedMessage)
   */
  renderMessage: function(messageID, callback) {
    Message.findOne({
      id: messageID
    }).exec(function(err, message) {
      if (err || message == undefined) {
        console.log("There was an error getting the message.");
        console.log("Error = " + err);
        callback(err, undefined);
      } else {
        message.title = marked(message.title);
        message.body = marked(message.body);
        callback(undefined, message);
      }
    });
  },

  /**
   * Render a set of messages from their ID's
   * @param :: messageIDs - the ids of the messages to lookup and render
   * @param :: callback(err, results)
   */
  renderMessages: function(messageIDs, callback) {
    async.map(messageIDs, function(id, cb) {
      renderMessage(id, function(err, temp) {
        if (err || temp == undefined) {
          console.log("There was an error finding the user.");
          console.log("Error = " + err);
          callback(err, undefined);
        } else {
          cb(temp);
        }
      });
    }, function(err, results) {
      if (err || results == undefined) {
        callback(err, undefined);
      } else {
        callback(undefined, results)
      }
    })
  },

};
