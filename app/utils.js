var tokenChars = '0123456789abcdefghijklmnopqrstuvwxyz';

var utils = {

  makeToken: function() {
    var token = '';
    for (var i = 0 ; i < 32 ; ++i) {
      token += tokenChars.charAt(Math.random() * tokenChars.length);
    }
    return token;
  }

};

module.exports = utils;