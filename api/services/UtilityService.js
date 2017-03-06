/**
 * Utility
 *
 * @author Steven T Hanna (http://www.github.com/steventhanna)
 * @description :: Some functions for general things
 *
 */

module.exports = {

  /**
   * Validate an email address
   * @param :: string - email: the string to test if it is a valid email or not
   * @return :: boolean: true if an email, false otherwise
   */
  validateEmail: function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },

  /**
   * Validate a URL
   * @param :: string - url: the string to test if it is a valid email or not
   * @return :: boolean: true if a url, false otherwise
   */
  validateURL: function(url) {
    var pattern = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);
    return pattern.test(url);
  }
}
