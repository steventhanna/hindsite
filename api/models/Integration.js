/**
 * Integration.js
 *
 * @description :: The representation for an IFTTT integration
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: {
      type: 'string'
    },

    webhook: {
      type: 'string'
    },

    state: {
      type: 'boolean'
    },

    monitors: {
      type: 'array',
      defaultsTo: '[]'
    }

  }
};
