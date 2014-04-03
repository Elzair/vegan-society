var fs      = require('fs')
  , monk    = require('monk')
  , util    = require('util')
  ;

var env = process.env.NODE_ENV || 'development';
// Read connection string from config file
var cfg = JSON.parse(fs.readFileSync(__dirname + util.format('/../conf/db.%s.json', env)));

// Initialize database connection
module.exports = monk(cfg.conn_str);
