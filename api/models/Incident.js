/**
 * Incident.js
 *
 * @description :: Model representation of incidents :: to keep track of when things go wrong
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    // The current status of the incident
    // Either Identified, Monitoring, Resolved, Update, Scheduled
    status: {
      type: 'string'
    },

    title: {
      type: 'string'
    },

    // All associated messages with the monitors
    messages: {
      type: 'array',
      defaultsTo: []
    },

    // The monitors that the incident affects
    monitors: {
      type: 'array',
      defaultsTo: []
    }

  }
};
