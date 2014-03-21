var fs   = require('co-fs')
    monk = require('monk')
  ;

// Initialize database connection

module.exports = monk('localhost/vegan');
