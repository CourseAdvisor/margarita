var fs = require('fs');
var path = require('path');

function getData() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../profiles.json')));
}

var profiles = {
  has: function(name) {
    return profiles.get(name) != null;
  },

  get: function(name) {
    try {
      return getData()[name];
    } catch(e){
      return null;
    }
  },

  all: function() {
    try {
      return getData();
    } catch(e){
      return null;
    }
  }
};

module.exports = profiles;