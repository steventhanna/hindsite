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

    // Frequency is in the form of a CRON job
    frequency: {
      type: 'string',
      required: true
    },

    notificationSettings: {
      type: 'array',
      defaultsTo: '[]'
    },

    currentHealth: {
      type: 'string'
    },

    averageResponseTime: {
      type: 'string'
    },

    numberOfRequestsSent: {
      type: 'float'
    }

  }
};
