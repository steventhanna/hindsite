/**
 * FrontController
 *
 * @description :: Server-side logic for managing the frontend
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  home: function(req, res) {
    DashService.getDashElement(function(dash) {
      if (dash.frontend == false) {
        res.redirect('/dashboard');
        res.end();
      } else {
        res.view('homepage');
      }
    });
  },

};
