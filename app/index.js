var utils = require('./utils');
var storage = require('./storage');
var profiles = require('./profiles');
var package = require('../package.json');

var allowedAttributes = ['uniqueid','name','firstname','unit','unitid','where','group','email'];

var app = {

  // Create an authentication token for one client and returns it
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

    /*
    version=2.1.2
    provider=
    firstname=Hadrien
    status=ok
    key=zt181vmv3ajvqjvp54unx4wgshieiltr
    email=hadrien.milano@epfl.ch
    group=Discrete-Optimization-2015,assts-progos,courseadvisor,eship_group2,lap-inf117-desktop-users,lap-lappc36-sudoers,lap-lappc36-users,lap-lappc40-users,lap-lappc47-users,lap-lappc48-users,lap-lappc5-users,lap-lappc63-sudoers,lap-lappc63-users,lap-lapsrv5-users,lap-students,lap_archord1_2013,lap_archord1_2013_examB,lap_archord2_2014,membres_robopoly_2012-2013,membres_robopoly_2013-2014,studentproj,swaggy-books,sweng_students_2014
    user=milano
    requesthost=128.179.254.237
    unitid=50075
    authstrength=1
    org=EPFL
    uniqueid=224340
    name=Milano
    where=IN-BA6/IN-S/ETU/EPFL/CH
    host=128.179.254.237
    unit=IN-BA6,Section d'informatique - Bachelor semestre 6
    authorig=cookie
    */

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

    // merge profile data into output
    var profile = profiles.get(data.user);
    for (var attrname in profile) {
      output[attrname] = profile[attrname];
    }

    return output;
  }
};

module.exports = app;