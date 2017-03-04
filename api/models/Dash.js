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
    endpoints: {
      type: 'array',
      defaultsTo: [],
      required: true
    },

    twitterAPIKey: {
      type: 'string'
    },

    slackAPIKey: {
      type: 'string'
    },

    postmarkAPIKey: {
      type: 'string'
    },

    signupkey: {
      type: 'string',
      defaultsTo: 'hindsite',
      required: true
    },
  }
};
