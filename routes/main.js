var entries = require('../models/entries')
  , render  = require('../lib/view')
  ;

exports.main = function *() {
  this.body = yield render('main');
};

exports.location = function *(id) {
  this.body = yield entries.findById(id);
};
