/**
 * Monitor.js
 *
 * @description :: The model representation of the monitor
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var uuid = require('node-uuid');

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

    // The id associated with the CRON job
    cronID: {
      type: 'string'
    },

    notificationSettings: {
      type: 'array',
      defaultsTo: '[]'
    },

    currentHealth: {
      type: 'string'
    },

    averageResponseTime: {
      type: 'float'
    },

    numberOfRequestsSent: {
      type: 'float'
    },

    // Essentially if the monitor is on or off
    canPing: {
      type: 'boolean',
      defaultsTo: true
    },

    // Generate a random ID for the cronID
    beforeCreate: function(monitor, cb) {
      monitor.cronID = uuid.v1();
      cb(null, monitor);
    }
  }
};
