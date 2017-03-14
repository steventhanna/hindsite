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

    health: {
      type: 'string'
    },

    averageResponseTime: {
      type: 'float'
    },

    // Essentially if the monitor is on or off
    // True for online, false for offline
    state: {
      type: 'boolean'
    },

    // The range that should be considered healthy for a ping
    healthyRange: {
      type: 'float'
    },

    rockyRange: {
      type: 'float'
    },

    // The number of pings to grab to calculate the moving average
    movingAverageWindow: {
      type: 'float'
    },

    // Generate a random ID for the cronID
    beforeCreate: function(monitor, cb) {
      monitor.cronID = uuid.v1();
      cb(null, monitor);
    }
  }
};
