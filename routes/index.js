var entries = require('../models/entries')
  , render  = require('../lib/view')
  ;

exports.index = function *() {
  this.response.body = yield render('main', {host: global.host});
};

exports.entry = function *(name) {
  var entry = yield entries.findOne({unique_name: encodeURI(name)});
  this.response.body = yield render('entry', {host: global.host, entry: entry});
};

exports.entry_by_id = function *(id) {
  var entry = yield entries.findById(id);
  this.response.body = yield render('entry', {host: global.host, entry: entry});
};
