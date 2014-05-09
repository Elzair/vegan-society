var entries   = require(__dirname + '/../models/entries')
  //, imghost   = require(__dirname + '/../lib/imghost')
  , cloudinary = require('cloudinary')
  , fs = require('co-fs')
  ;

exports.search = function *() {
  cloudinary.config(JSON.parse(yield fs.readFile(__dirname+'/../conf/cloudinary.json', {encoding: 'utf8'})));
  // Handle invalid query
  if (!this.request.query.lat || !this.request.query.lng) {
    this.response.status = 406;
    this.response.body = JSON.stringify({"Error": "Invalid Parameters!"});
    return;
  }

  // Retrieve values from database
  var lat = parseFloat(this.request.query.lat);
  var lng = parseFloat(this.request.query.lng);
  var maxDistance = this.request.query.maxDistance ? parseInt(this.request.query.maxDistance, 10) : 50000;
  var point = {type: "Point", coordinates: [ lng, lat]};
  var ents = yield entries.find({location: {$near: {$geometry: point, $maxDistance: maxDistance}}});
  console.log(require('util').format('%j', ents));

  // Return only the listed fields
  var filtered_entries = [];
  var fields = [
      '_id'
    , 'address1'
    , 'address2'
    , 'categories'
    , 'city'
    , 'country'
    , 'location'
    , 'name'
    , 'postal_code'
    , 'region'
    , 'short_description'
  ];

  for (var i=0; i<ents.length; i++) {
    // Make sure the entry object has a valid property for all 
    // the fields listed above
    var new_entry = {};
    for (var j=0; j<fields.length; j++) {
      new_entry[fields[j]] = ents[i][fields[j]] || '';
    }

    // Return first image as thumbnail, if available
    if (ents[i].images && ents[i].images.length > 0 && ents[i].images[0].id !== undefined) {
      console.log(cloudinary.url(ents[i].images[0].id, {width: 160, height: 100, crop: 'fill'}));
      new_entry.thumbnails = [
          cloudinary.url(ents[i].images[0].id, {width: 160, height: 100, crop: 'fill'})
        , cloudinary.url(ents[i].images[0].id, {width: 320, height: 200, crop: 'fill'})
      ];
      new_entry.caption = ents[i].images[0].caption || '';
    }
    else {
      new_entry.thumbnails = ['', ''];
      new_entry.caption = '';
    }
    
    filtered_entries.push(new_entry);
  }

  // Set response headers
  this.response.type = 'application/json';
  this.response.set('Access-Control-Allow-Origin', '*');

  // Return JSON formatted results for the given search
  this.response.body = JSON.stringify(filtered_entries);
};

exports.location = function *(id) {
  // Set response headers
  this.response.type = 'application/json';
  this.response.set('Access-Control-Allow-Origin', '*');

  // Return JSON formatted data for specified entry
  this.response.body = yield entries.findById(id);
};

