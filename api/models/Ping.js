/**
 * Ping.js
 *
 * @description :: Represents a Ping, or what is retrieved after making a request from a monitor.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    // The Numerical Status Code
    status: {
      type: 'string'
    },

    monitorID: {
      type: 'string',
      required: true
    },

    elapsedTime: {
      type: 'float'
    },

    targetURL: {
      type: 'string'
    },

  }
};
