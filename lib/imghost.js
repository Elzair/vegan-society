var cloudinary = require('cloudinary')
  , fs         = require('fs')
  ;

cloudinary.config(JSON.parse(fs.readFileSync(__dirname + '/../conf/cloudinary.json')));

module.exports = cloudinary;
