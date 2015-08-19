var express = require('express');
var router = express.Router();
var app = require('../app/index');
var storage = require('../app/storage');
var profiles = require('../app/profiles');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    storage: storage.dump(),
    profiles: profiles.all()
  });
});


router.post('/createrequest', function(req, res, next) {
  var params = decodeBody(req.body.toString());
  var key = app.createRequest(params);
  res.send("key="+key);
});

router.get('/requestauth', function(req, res, next) {
  var key = req.query.requestkey;

  if (key == null) {
    return res.send('Error: No key provided. You must provide a requestkey GET parameter.', 400);
  }

  var data = app.requestAuth(key);
  data.badLogin = req.flash('login-error')[0];
  data.username = req.flash('login-username')[0];

  res.render('requestAuth', data);
});

router.post('/login', function(req, res, next) {
  var url = app.login(req.body);
  if (url) {
    res.redirect(url);
  } else {
    req.flash('login-error', true);
    req.flash('login-username', req.body.username);
    res.redirect('/requestauth?requestkey='+req.body.requestkey);
  }
});

router.post('/fetchattributes', function(req, res, next) {
  var params = decodeBody(req.body.toString());
  var attrs = app.fetchAttributes(req, params.key);
  var responseText = '';
  for (var i in attrs) {
    responseText += i+'='+attrs[i]+'\n';
  }
  res.send(responseText);
});


router.get('/logout', function(req, res, next) {
  // Nothing fancy to do here since we do not persist sessions
  if (req.query.urlaccess) {
    res.redirect(req.query.urlaccess);
  } else {
    res.send('Logged out.');
  }
});

// Decodes the strange body format tequila's API expects
function decodeBody(reqBody) {
  var params = {};
  var body = reqBody.split('\n');

  for (var i in body) {

    // Ignore malformed lines
    if (!/^\w+=.+$/.test(body[i])) {
      continue;
    }

    var cut = body[i].split('=');
    var key = cut[0];
    var val = cut[1];

    params[key] = val;

    // request parameter is a list
    if (key === 'request') {
      params[key] = params[key].split(',');
    }
  }

  return params;
}


module.exports = router;
