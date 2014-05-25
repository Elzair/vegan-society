var entries   = require(__dirname + '/../models/entries')
  , imghost   = require(__dirname + '/../lib/imghost')
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
  var ents = yield entries.find({location: {$near: {$geometry: point, $maxDistance: maxDistance}}});

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
    , 'unique_name'
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
      new_entry.thumbnails = [
          imghost.url(ents[i].images[0].id, {width: 160, height: 100, crop: 'fill'})
        , imghost.url(ents[i].images[0].id, {width: 320, height: 200, crop: 'fill'})
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

exports.entry = function *(name) {
  // Fetch entry
  var entry = yield entries.findOne({unique_name: encodeURI(name)});

  // Add imghost url to all images
  for (var i=0; i<entry.images.length; i++) {
    entry.images[i].url = imghost.url(entry.images[i].id, {width: 400, height: 400, crop: 'fill'});
  }

  // Set response headers
  this.response.type = 'application/json';
  this.response.set('Access-Control-Allow-Origin', '*');

  // Return JSON formatted data for specified entry
  this.response.body = entry;
};

exports.entry_by_id = function *(id) {
  // Fetch entry
  var entry = yield entries.findById(id);

  // Add imghost url to all images
  for (var i=0; i<entry.images.length; i++) {
    entry.images[i].url = imghost.url(entry.images[i].id, {width: 400, height: 400, crop: 'fill'});
  }

  // Set response headers
  this.response.type = 'application/json';
  this.response.set('Access-Control-Allow-Origin', '*');

  // Return JSON formatted data for specified entry
  this.response.body = entry;
};
