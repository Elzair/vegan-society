var fs   = require('fs')
    monk = require('monk')
  ;

// Read connection string from config file
var cfg = JSON.parse(fs.readFileSync(__dirname + "/../conf/db.json"));

// Initialize database connection
module.exports = monk(cfg.conn_str);
