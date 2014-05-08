var cloudinary = require('cloudinary')
  , co = require('co')
  , fs      = require('co-fs')
  , request = require('co-request')
  , util    = require('util')
  ;

// List what parts of each entry to include
var localized_include = [
    'name'
  , 'short_description'
  , 'long_description'
  , 'address1'
  , 'address2'
  , 'neighborhood'
  , 'city'
  , 'region'
  , 'postal_code'
];
var include = [
    'sortable_name'
  , 'country'
  , 'phone'
  , 'website'
  , 'price_range'
  , 'allows_smoking'
  , 'is_wheelchair_accessible'
  , 'accepts_reservations'
  , 'is_cash_only'
  , 'payment_options'
  , 'categories'
  , 'cuisines'
  , 'tags'
  ,  'hours'
  , 'images'
];
var special_include = [
];

/**
 * This function filters out all nonvegan entries & only includes the
 * properties in the include or localized_include arrays above.
 * @param arr array of entries
 * @return filtered array
 */
function filter(arr) {
  var results = [];
  arr.forEach(function(element, index, array) {
    if (element.veg_level === '5') {
      var obj = {};
      include.forEach(function(prop, i, a) {
        if (element.hasOwnProperty(prop)) {
          obj[prop] = element[prop];
        }
      });
      localized_include.forEach(function(prop, i, a) {
        obj[prop] = {};
        if (element.hasOwnProperty(prop)) {
          obj[prop].en_us = element[prop];
        }
        if (element.hasOwnProperty('localized_'+prop)) {
          obj[prop].other = element['localized_'+prop];
        }
      });
      // Handle hours and images specially
      obj.images  = [];
      element.images.forEach(function(img, i, a) {
        var new_img = {caption: img.caption || '', mime_type: img.mime_type};
        // Upload original image to cloudinary and get secure URL
        cloudinary.uploader.upload(img.files[3].uri, function(result) {
          new_img.id = result.public_id;
          new_img.url = result.secure_url;
        });
        obj.images.push(new_img);
      });
      results.push(obj);
    }
  });
  return results;
}

/**
 * This function adds some properties to an array of entries
 * @param arr array of entries
 * @param names array of already reserved names
 * @return array with added properties
 */
function add(arr, names) {
  for (var i=0; i<arr.length; i++) {
    arr[i].imported = true;
    var count = 0; // Number of time unique name already appears
    for (var j=0; j<names.length; j++) {
      if (names[j].startsWith(encodeURI(arr[i].name.en_us))) {
        count++;
      }
    }
    arr[i].unique_name = count > 0 ? encodeURI(arr[i].name.en_us) + '-' + count.toString() : encodeURI(arr[i].name.en_us);
    names.push(arr[i].unique_name);
  }
  return arr;
}

co(function* () {
  // Read in config data
  var conf_data = yield fs.readFile(__dirname + '/conf/auth.json', {encoding: 'utf8'});
  var conf = JSON.parse(conf_data);

  // Initialize cloudinary
  cloudinary.config(conf.cloudinary);

  // Create output directory if it does not yet exist
  try {
    yield fs.mkdir(__dirname+'/output');
  }
  catch (e) {
    if (e.code === 'EEXIST') {
      console.log('Output directory already exists. Moving on.');
    }
  }

  // Get starting entry number and final entry number
  var first_entry = process.argv[2] || 1;
  var last_entry = process.argv[3] || 3000;

  // Write first '[' to file if not resuming from previous attempt
  if (first_entry <= 1) {
    yield fs.writeFile(__dirname + '/output/locations.json', '[');
  }

  // Create array of unique names
  var unique_names = [];

  var separator = '';
  for (var i=first_entry; i<last_entry; i++) {
    console.log('Now fetching entries for region ' + i.toString());
    var results = yield request.get({url: 'http://www.vegguide.org/region/'+i.toString(), 
      headers: {'Accept': 'application/json'}});
    var region = JSON.parse(results.body);

    if (region.hasOwnProperty('regions')) {
      console.error('Nonexistent region: ' + i.toString());
      continue;
    }

    if (parseInt(region.entry_count, 10) > 0) {
      var locresults = yield request.get({url: 'http://www.vegguide.org/region/'+i.toString()+'/entries', 
        headers: {'Accept': 'application/json', 'User-Agent': 'VeganSocietyCrawler'}});
      var locations = add(filter(JSON.parse(locresults.body)), unique_names);

      // Add GPS coordinates to locations
      for (var j=0; j<locations.length; j++) {
        var l = locations[j];

        // Do not waste bandwidth on entries with incomplete data
        if (l.address1.en_us === undefined || l.city.en_us === undefined || l.region.en_us === undefined) {
          continue;
        }

        //// Use MapQuest Open's Geocoding API
        //var qry_str = encodeURIComponent(util.format('%s %s, %s', l.address1.en_us, l.city.en_us, l.region.en_us));
        //var url = util.format('http://open.mapquestapi.com/nominatim/v1/search?q=%s&format=json', qry_str);
        // Use Google's Geocoding API
        var qry_str = encodeURI(util.format('%s, %s, %s', l.address1.en_us, l.city.en_us, l.region.en_us));
        var url = util.format('https://maps.googleapis.com/maps/api/geocode/json?address=%s&sensor=false&key=%s', 
            qry_str, conf.google_maps.api_key);
        console.log(url);

        // Store location as a GeoJSON Point object http://geojson.org/geojson-spec.html#id2
        var gpsresults = yield request.get({url: url, headers: {'User-Agent': 'VeganSocietyCrawler'}});
        var gpsbody = JSON.parse(gpsresults.body);
        //if (gpsbody.length > 0) {
        if (gpsbody.status === 'OK') {
          var loc = gpsbody.results[0].geometry.location;
          l.location = {
              type: "Point"
            //, coordinates: [parseFloat(gpsbody[0].lon, 10), parseFloat(gpsbody[0].lat, 10)]
            , cooordinates: [loc.lng, loc.lat]
          };
        }
      }

      var output = util.format('%j', locations);
      // Strip first "[" and last "]" from output
      output = separator + output.substring(1, output.length-1);
      separator = ',';
      yield fs.appendFile(__dirname + '/output/locations.json', output);
    }
  }

  // Write last ']' to file if program handled all entries
  if (last_entry === 3000) {
    yield fs.appendFile(__dirname + '/output/locations.json', ']');
  }
})();
