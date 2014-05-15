var cloudinary = require('cloudinary')
  , colors     = require('colors')
  , co         = require('co')
  , fs         = require('co-fs')
  , request    = require('co-request')
  , util       = require('util')
  ;

// Set color themes
colors.setTheme({
    code: 'cyan'
  , debug: 'grey'
  , error: 'red'
  , info: 'blue'
  , success: 'green'
  , warning: 'yellow'
});

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
];

function img_upload(url) {
  return function(fn) {
    cloudinary.uploader.upload(url, function(result) {
      fn(null, result.public_id);
    });
  };
}

/**
 * This function filters out all nonvegan entries & only includes the
 * properties in the include or localized_include arrays above.
 * @param arr array of entries
 * @return filtered array
 */
function *filter(arr, num) {
  console.log(util.format('Filtering entries for region %d', num).debug);
  var results = [];
  //arr.forEach(function(element, index, array) {
  for (var i=0; i<arr.length; i++) {
    var element = arr[i];
    if (element.veg_level === '5') {
      console.log(util.format('%s matches!', element.name).debug);
      var obj = {};
      //include.forEach(function(prop, i, a) {
      for (var j=0; j<include.length; j++) {
        var prop = include[j];
        if (element.hasOwnProperty(prop)) {
          obj[prop] = element[prop];
        }
      }//);
      //localized_include.forEach(function(prop, i, a) {
      for (var k=0; k<localized_include.length; k++) {
        var locprop = localized_include[k];
        obj[locprop] = {};
        if (element.hasOwnProperty(locprop)) {
          obj[locprop].en_us = element[locprop];
        }
        if (element.hasOwnProperty('localized_'+locprop)) {
          obj[locprop].other = element['localized_'+locprop];
        }
      }//);
      // Handle images specially
      obj.images  = [];
      if (element.images) {
        //element.images.forEach(function(img, i, a) {
        for (var m=0; m<element.images.length; m++) {
          var img = element.images[m];
          var new_img = {caption: img.caption || '', mime_type: img.mime_type};
          // Upload original image to cloudinary and get resulting ID
          new_img.id = yield img_upload(img.files[3].uri);
          console.log(util.format('Uploaded "%s" to %s', new_img.caption, cloudinary.url(new_img.id)).info);
          obj.images.push(new_img);
        }//);
      }
      results.push(obj);
    }
  }//);
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
    var count = 0; // Number of time "unique" name already appears
    for (var j=0; j<names.length; j++) {
      if (names[j].startsWith(encodeURI(arr[i].name.en_us))) {
        count++;
      }
    }
    // Set element's unique_name equal to either its encoded name or its encoded name plus the number of previous
    // locations with the same encoded name
    arr[i].unique_name = count > 0 ? encodeURI(arr[i].name.en_us) + '-' + count.toString() : encodeURI(arr[i].name.en_us);
    names.push(arr[i].unique_name);
  }
  return arr;
}

/**
 * Main Function
 */
co(function* () {
  console.log('Starting crawler'.info);
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
      console.log('Output directory already exists. Moving on.'.warning);
    }
  }

  // Get starting entry number and final entry number
  var first_entry = process.argv[2] || 1;
  var last_entry = process.argv[3] || 3000;

  // Write first '[' to file
  yield fs.writeFile(__dirname + '/output/locations.json', '[');

  // Create array of unique names
  var unique_names = [];

  var separator = '';
  for (var i=first_entry; i<last_entry; i++) {
    // Fetch data for each entry
    console.log('Now fetching entries for region '.info + i.toString().info);
    var results = yield request.get({url: 'http://www.vegguide.org/region/'+i.toString(), 
      headers: {'Accept': 'application/json'}});
    var region = JSON.parse(results.body);

    // Handle invalid regions
    if (region.hasOwnProperty('regions')) {
      console.error('Nonexistent region: '.error + i.toString().error);
      continue;
    }

    if (parseInt(region.entry_count, 10) > 0) {
      var locresults = yield request.get({url: 'http://www.vegguide.org/region/'+i.toString()+'/entries', 
        headers: {'Accept': 'application/json', 'User-Agent': 'VeganSocietyCrawler'}});
      var locations = add(yield filter(JSON.parse(locresults.body), i), unique_names);

      // Add GPS coordinates to vegan locations
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
        var gpsresults = yield request.get({url: url, headers: {'User-Agent': 'VeganSocietyCrawler'}});
        var gpsbody = JSON.parse(gpsresults.body);
        //if (gpsbody.length > 0) {
        if (gpsbody.status === 'OK') {
          var loc = gpsbody.results[0].geometry.location;
          // Store location as a GeoJSON Point object http://geojson.org/geojson-spec.html#id2
          l.location = {
              type: "Point"
            //, coordinates: [parseFloat(gpsbody[0].lon, 10), parseFloat(gpsbody[0].lat, 10)]
            , coordinates: [loc.lng, loc.lat]
          };
        }
      }

      // Add any vegan locations to output file
      if (locations.length > 0) {
        var output = util.format('%j', locations);
        // Strip first "[" and last "]" from output
        output = separator + output.substring(1, output.length-1);
        separator = ',';
        yield fs.appendFile(__dirname + '/output/locations.json', output);
      }
    }
  }

  // Write last ']' to file
  yield fs.appendFile(__dirname + '/output/locations.json', ']');

  // Log output
  console.log('All regions have been fetched!'.success);
  console.log('Import the data with the following command: '.info);
  console.log('mongoimport -h host:port -d database -c entries -u username -p password --jsonArray output/locations.json'.code);
  console.log('Also, make sure to log into the Mongo shell and issue the following command'.info);
  console.log('db.entries.ensureIndex({location: "2dsphere"});'.code);
})();
