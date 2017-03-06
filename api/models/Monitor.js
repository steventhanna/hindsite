/**
 * Monitor.js
 *
 * @description :: The model representation of the monitor
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    targetURL: {
      type: 'string',
      required: true
    },

    frequency: {
      type: 'string',
      required: true
    },

    notificationSettings: {
      type: 'array',
      defaultsTo: '[]'
    }

  }
};
