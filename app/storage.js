/*
  storage.js

  Inefficient self-cleaning time-limited memory storage.
 */


// Values in the store expire at least 1 hour after they have last been used.
var TTL = 3600 * 1000;

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

var Storage = function() {

  var data = {};

  function clean() {
    for (var i in data) {
      var now = Date.now();
      if (now - data[i].touched > TTL) {
        delete data[i];
      }
    }
  }

  // Sets the value associated with `key` to a copy of val.
  this.put = function(key, val) {
    data[key] = {
      value: deepClone(val),
      touched: Date.now()
    };
    clean();
  };


  // Returns a copy of the value associated with `key` and resets it's TTL.
  this.get = function(key) {
    var entry = data[key];
    if (entry == null) {
      return null;
    }
    entry.touched = Date.now();
    clean();
    return deepClone(entry.value);
  };

  // Deletes the entry associated with `key`.
  this.remove = function(key) {
    delete data[key];
  };

  this.dump = function() {
    clean();
    var res = {};

    for (var i in data) {
      var now = Date.now();
      res[i] = data[i].value;
    }

    return res;
  };
};

module.exports = new Storage();