var entries = require('../models/entries')
  , render  = require('../lib/view')
  ;

exports.index = function *() {
  console.log(this.request.header);
  this.response.body = yield render('main', {host: global.host});
};

exports.location = function *(id) {
  console.log(this.request.header);
  //this.response.body = yield entries.findById(id);
  var entry = yield entries.findById(id);
  // Ajax Request
  if (this.request.header.referer !== undefined) {
    this.response.type = 'application/json';
    this.response.set('Access-Control-Allow-Origin', '*');
    this.response.body = entry;
  }
  else {
    this.response.body = yield render('entry', {host: global.host, entry: entry});
  }
};

exports.search = function *() {
  console.log(this.request.header);
  this.response.type = 'application/json';
  this.response.set('Access-Control-Allow-Origin', '*');
  if (this.request.query.lat === undefined || this.request.query.lng === undefined) {
    this.response.status = 406;
    this.response.body = JSON.stringify({"Error": "Invalid Parameters!"});
    return;
  }
  var lat = parseFloat(this.request.query.lat);
  var lng = parseFloat(this.request.query.lng);
  var maxDistance = this.request.query.maxDistance ? parseInt(this.request.query.maxDistance, 10) : 50000;
  var point = {type: "Point", coordinates: [ lng, lat]};
  this.response.body = yield entries.find({coordinates: {$near: {$geometry: point, $maxDistance: maxDistance}}});
};
