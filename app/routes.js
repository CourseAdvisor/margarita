var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var marked = require('marked');
var actions = require('./actions');
var storage = require('./storage');
var profiles = require('./profiles');
var ActionError = require('./ActionError');

// Markdown renderer to render the manual
marked.setOptions({
  gfm: true
});

/* GET home page. */
router.get('/', function(req, res, next) {
  fs.readFile(path.join(__dirname, '../MANUAL.md'), function(err, markdown) {
    if (err) next(err);
    res.render('index', {
      storage: storage.dump(),
      profiles: profiles.all(),
      docHTML: marked(markdown.toString())
    });
  });
});


/* API */

router.post('/createrequest', function(req, res, next) {
  var params = decodeBody(req.body.toString());
  var key = actions.createRequest(params);
  res.send("key="+key);
});

router.get('/requestauth', function(req, res, next) {
  var key = req.query.requestkey;

  if (key == null) {
    throw ActionError('Error: No key provided. You must provide a requestkey GET parameter.', 400);
  }

  var data = actions.requestAuth(key);
  data.badLogin = false;
  data.username = '';
  res.render('requestAuth', data);
});

router.post('/login', function(req, res, next) {
  var url = actions.login(req.body);
  if (url) {
    res.redirect(url);
  } else {
    var data = actions.requestAuth(req.body.requestkey);
    data.badLogin = true;
    data.username = req.body.username;
    res.render('requestAuth', data);
  }
});

router.post('/fetchattributes', function(req, res, next) {
  var params = decodeBody(req.body.toString());
  var attrs = actions.fetchAttributes(req, params.key);
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
