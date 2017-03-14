/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
   * etc. depending on your default view engine) your home page.              *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  'GET /': {
    view: 'homepage'
  },

  'POST /user/edit': {
    controller: 'user',
    action: 'edit'
  },

  'POST /user/delete': {
    controller: 'user',
    action: 'delete'
  },

  'POST /user/signup': {
    controller: 'auth',
    action: 'signup'
  },

  'POST /user/login': {
    controller: 'auth',
    action: 'login'
  },

  'POST /dash/edit': {
    controller: 'dash',
    action: 'edit'
  },

  'GET /setup': {
    controller: 'setup',
    action: 'createView',
  },

  'GET /dashboard': {
    controller: 'dash',
    action: 'dashboard'
  },

  'GET /login': {
    controller: 'setup',
    action: 'loginView'
  },

  'GET /signup': {
    controller: 'setup',
    action: 'signupView'
  },

  'GET /logout': {
    controller: 'auth',
    action: 'logout'
  },

  'GET /settings': {
    controller: 'dash',
    action: 'settings'
  },

  'GET /monitors': {
    controller: 'dash',
    action: 'monitors'
  },

  'POST /monitor/new': {
    controller: 'monitor',
    action: 'new'
  },

  'POST /monitor/edit': {
    controller: 'monitor',
    action: 'edit'
  },

  'POST /monitor/delete': {
    controller: 'monitor',
    action: 'delete'
  },

  'POST /monitor/state': {
    controller: 'monitor',
    action: 'state'
  },

  'GET /monitors/view/:monitorID': {
    controller: 'dash',
    action: 'viewMonitor'
  },

  'GET /monitors/data/:monitorID/pings': {
    controller: 'monitor',
    action: 'pings'
  },

  'GET /monitors/data/:monitorID/lastPing': {
    controller: 'monitor',
    action: 'lastPing'
  },

  'GET /socket/watch/monitor/:monitorID': {
    controller: 'monitor',
    action: 'subscribeToMonitor'
  },

  'GET /socket/watch/monitors': {
    controller: 'monitor',
    action: 'subscribeToMonitors'
  },

  'GET /socket/watch/monitors/dash': {
    controller: 'dash',
    action: 'subscribe'
  },

  'GET /integrations': {
    controller: 'dash',
    action: 'integrations'
  },

  'GET /integrations/edit/:integrationID': {
    controller: 'dash',
    action: 'viewIntegration'
  },

  'POST /integration/new': {
    controller: 'integration',
    action: 'new'
  },

  'POST /integration/edit': {
    controller: 'integration',
    action: 'edit'
  },

  'POST /integration/delete': {
    controller: "integration",
    action: 'delete'
  },

  /***************************************************************************
   *                                                                          *
   * Custom routes here...                                                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the custom routes above, it   *
   * is matched against Sails route blueprints. See `config/blueprints.js`    *
   * for configuration options and examples.                                  *
   *                                                                          *
   ***************************************************************************/

};
