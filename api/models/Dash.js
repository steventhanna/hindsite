/**
 * Dash.js
 *
 * @description :: The model representation of the Dashboard element
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    // The list of endpoints to test
    // This is a list of ID's
    monitors: {
      type: 'array',
      defaultsTo: [],
    },

    name: {
      type: 'string',
      required: true,
      defaultsTo: 'Hindsite'
    },

    signupkey: {
      type: 'string',
      defaultsTo: 'hindsite',
      required: true
    },

    // If true, enable the front end reporting
    // Otherwise redirect to the login
    frontend: {
      type: 'boolean',
      required: true
    },

    // Website tracking code to be injected near the top of the page
    // Content inside of this code will not be escaped, and will be injected
    // direclty into the page
    trackingCode: {
      type: 'string'
    }

  }
};
