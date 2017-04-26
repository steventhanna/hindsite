/**
 * Message.js
 *
 * @description :: Model representation for messages to be used in accordance with incidents
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    title: {
      type: 'string'
    },

    body: {
      type: 'string'
    },

    // The monitors the message is about
    monitors: {
      type: 'array',
      defaultsTo: []
    }

  }
};
