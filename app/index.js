var utils = require('./utils');
var storage = require('./storage');
var profiles = require('./profiles');
var package = require('../package.json');

var allowedAttributes = ['uniqueid','name','firstname','unit','unitid','where','group','email'];

var app = {

  // Creates an authentication token for one client and returns it
  createRequest: function(params) {

    for (var i in params.request) {
      var attr = params.request[i];
      if (allowedAttributes.indexOf(attr) < 0) {
        throw new Error('Invalid request attribute: '+attr);
      }
    }

    if (params['urlaccess'] == undefined) {
      throw new Error('No urlaccess specified');
    }

    var key = utils.makeToken();
    storage.put(key, params);
    return key;
  },

  // Creates data for the authentication page using the previously created token.
  requestAuth: function(key) {
    var data = storage.get(key);
    if (data == null) {
      throw new Error('Invalid key: '+key);
    }

    return {
      service: data.service,
      requestkey: key
    };
  },

  // Tries to authenticate a user using the form data and invalidates the associated key.
  // On success, returns a url the user should be redirected to.
  // On unsucessful login, returns false.
  login: function(form) {

    var token = form.requestkey;
    var data = storage.get(token);
    if (data == null) {
      throw new Error('Invalid key: '+token);
    }

    var password = form.password;
    var username = form.username;

    if (password == username && profiles.has(username))  {
      storage.remove(token);
      var key = utils.makeToken();

      // authenticate session
      data.user = username;
      storage.put('auth_'+key, data);

      return data.urlaccess+'?key='+key;
    } else {
      return false;
    }
  },


  fetchAttributes: function(req, key) {

    var data = storage.get('auth_'+key);

    if (!data) {
      throw new Error('Unable to read session: '+key);
    }

    var output = {
      // software information
      version: package.version,
      provider: package.name,

      // request data
      status: 'ok',
      key: key,
      requesthost: req.connection.remoteAddress,
      host: req.connection.remoteAddress, // seems to be the same as above
      authstrength: 1, // I have no idea what this means
      authorig: 'cookie', // ???

      user: data.user
    };

    // merge requested profile data into output
    var profile = profiles.get(data.user);
    for (var i in data.request) {
      var attrname = data.request[i];
      output[attrname] = profile[attrname];
    }

    return output;
  }
};

module.exports = app;
