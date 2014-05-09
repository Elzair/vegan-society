var entries = require('../models/entries')
  , render  = require('../lib/view')
  ;

exports.index = function *() {
  this.response.body = yield render('main', {host: global.host});
};

exports.location = function *(id) {
  var entry = yield entries.findById(id);
  this.response.body = yield render('entry', {host: global.host, entry: entry});
};
