var render = require('../lib/view')

exports.main = function *() {
  this.body = yield render('main');
};
