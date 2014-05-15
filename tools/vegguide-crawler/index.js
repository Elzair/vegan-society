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

// Convert cloudinary's image uploader function from a callback to a yieldable
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
 * @param entries array of entries
 * @return filtered array
 */
function *filter(entries) {
  var filtered_entries = [];
  for (var i=0; i<entries.length; i++) {
    var entry = entries[i];
    if (entry.veg_level === '5') {
      console.log(util.format('%s matches!', entry.name).debug);
      var filtered_entry = {};
      for (var j=0; j<include.length; j++) {
        var prop = include[j];
        if (entry.hasOwnProperty(prop)) {
          filtered_entry[prop] = entry[prop];
        }
      }
      for (var k=0; k<localized_include.length; k++) {
        var locprop = localized_include[k];
        filtered_entry[locprop] = {};
        if (entry.hasOwnProperty(locprop)) {
          filtered_entry[locprop].en_us = entry[locprop];
        }
        if (entry.hasOwnProperty('localized_'+locprop)) {
          filtered_entry[locprop].other = entry['localized_'+locprop];
        }
      }
      // Handle images specially
      filtered_entry.images  = [];
      if (entry.images) {
        for (var m=0; m<entry.images.length; m++) {
          var img = entry.images[m];
          var new_img = {caption: img.caption || '', mime_type: img.mime_type};
          // Upload original image to cloudinary and get resulting ID
          new_img.id = yield img_upload(img.files[3].uri);
          console.log(util.format('Uploaded "%s" to %s', new_img.caption, cloudinary.url(new_img.id)).info);
          filtered_entry.images.push(new_img);
        }
      }
      filtered_entries.push(filtered_entry);
    }
  }
  return filtered_entries;
}

/**
 * This function adds some properties to an array of entries
 * @param entries array of entries
 * @param names array of already reserved names
 * @param conf config data
 * @return array with added properties
 */
function *add(entries, names, conf) {
  for (var i=0; i<entries.length; i++) {
    var entry = entries[i];

    // Mark each entry as imported from VegGuide
    entry.imported = true;

    // Set entry's unique_name equal to either its encoded name or its encoded name plus the number of previous
    // entries with the same encoded name
    var count = 0; // Number of time "unique" name already appears
    for (var j=0; j<names.length; j++) {
      if (names[j].startsWith(encodeURI(entry.name.en_us))) {
        count++;
      }
    }
    entry.unique_name = count > 0 ? encodeURI(entry.name.en_us) + '-' + count.toString() : encodeURI(entry.name.en_us);
    names.push(entry.unique_name);

    // Find GPS coordinates of entry if given complete data
    if (entry.address1.en_us !== undefined && entry.city.en_us !== undefined && entry.region.en_us !== undefined) {
      // Use Google's Geocoding API
      var qry_str = encodeURI(util.format('%s, %s, %s', entry.address1.en_us, entry.city.en_us, entry.region.en_us));
      var url = util.format('https://maps.googleapis.com/maps/api/geocode/json?address=%s&sensor=false&key=%s', 
          qry_str, conf.google_maps.api_key);
      console.log(url);
      var gpsresults = yield request.get({url: url, headers: {'User-Agent': 'VeganSocietyCrawler'}});
      var gpsbody = JSON.parse(gpsresults.body);
      if (gpsbody.status === 'OK') {
        var loc = gpsbody.results[0].geometry.location;
        entry.location = {
            type: "Point"
          , coordinates: [loc.lng, loc.lat]
        };
      }
    }
  }
  return entries;
}

/**
 * Main Function
 */
co(function* () {
  console.log('Starting crawler'.info);

  // Read in config data
  var conf = JSON.parse(yield fs.readFile(__dirname + '/conf/auth.json', {encoding: 'utf8'}));

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
  yield fs.writeFile(__dirname + '/output/entries.json', '[');

  // Create array of unique names
  var unique_names = [];

  var separator = '';
  // Fetch data for each region
  for (var i=first_entry; i<last_entry; i++) {
    console.log(util.format('Now fetching entries for region %d', i).info);
    var results = yield request.get({url: 'http://www.vegguide.org/region/'+i.toString(), 
      headers: {'Accept': 'application/json', 'User-Agent': 'VeganSocietyCrawler'}});
    var region = JSON.parse(results.body);

    // Handle invalid regions
    if (region.hasOwnProperty('regions')) {
      console.error(util.format('Nonexistent region: %d', i));
      continue;
    }

    // Fetch entry data for each region
    if (parseInt(region.entry_count, 10) > 0) {
      var entry_results = yield request.get({url: 'http://www.vegguide.org/region/'+i.toString()+'/entries', 
        headers: {'Accept': 'application/json', 'User-Agent': 'VeganSocietyCrawler'}});
      var entries = yield add(yield filter(JSON.parse(entry_results.body)), unique_names, conf);

      // Add any vegan locations to output file
      if (entries.length > 0) {
        var output = util.format('%j', entries);
        // Strip first "[" and last "]" from output
        output = separator + output.substring(1, output.length-1);
        separator = ',';
        yield fs.appendFile(__dirname + '/output/entries.json', output);
      }
    }
  }

  // Write last ']' to file
  yield fs.appendFile(__dirname + '/output/entries.json', ']');

  // Log output
  console.log('All regions have been fetched!'.success);
  console.log('Import the data with the following command: '.info);
  console.log('mongoimport -h host:port -d database -c entries -u username -p password --jsonArray output/entries.json'.code);
  console.log('Also, make sure to log into the Mongo shell and issue the following command'.info);
  console.log('db.entries.ensureIndex({location: "2dsphere"});'.code);
})();
