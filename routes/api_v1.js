var entries   = require('../models/entries')
  ;

exports.search = function *() {
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
  var ents = yield entries.find({coordinates: {$near: {$geometry: point, $maxDistance: maxDistance}}});

  // Return only the listed fields
  var filtered_entries = [];
  var fields = [
      '_id'
    , 'address1'
    , 'address2'
    , 'categories'
    , 'city'
    , 'coordinates'
    , 'country'
    , 'name'
    , 'postal_code'
    , 'region'
    , 'short_description'
  ];

  var start = {latitude: lat, longitude: lng};
  for (var i=0; i<ents.length; i++) {
    // Make sure the entry object has a valid property for all 
    // the fields listed above
    var new_entry = {};
    for (var j=0; j<fields.length; j++) {
      new_entry[fields[j]] = ents[i][fields[j]] || '';
    }

    // Return first image as thumbnail, if available
    if (ents[i].images && ents[i].images.length > 0) {
      new_entry.thumbnails = [
          ents[i].images[0].files[0].uri
        , ents[i].images[0].files[1].uri
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

