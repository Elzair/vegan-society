var co = require('co')
  , fs      = require('co-fs')
  , request = require('co-request')
  , util    = require('util')
  ;

// List what parts of each entry to include
var include = [
    'name'
  , 'sortable_name'
  , 'localized_name'
  , 'short_description'
  , 'localized_short_description'
  , 'long_description'
  , 'localized_long_description'
  , 'address1'
  , 'address2'
  , 'neighborhood'
  , 'city'
  , 'region'
  , 'postal_code'
  , 'localized_address1'
  , 'localized_address2'
  , 'localized_neighborhood'
  , 'localized_city'
  , 'localized_region'
  , 'localized_postal_code'
  , 'country'
  , 'phone'
  , 'website'
  , 'price_range'
  , 'hours'
  , 'allows_smoking'
  , 'is_wheelchair_accessible'
  , 'accepts_reservations'
  , 'is_cash_only'
  , 'payment_options'
  , 'categories'
  , 'cuisines'
  , 'tags'
  , 'images'
];

/**
 * This function filters out all nonvegan entries & only includes the
 * properties in the include array above.
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
      results.push(obj);
    }
  });
  return results;
}

/**
 * This function adds some properties to an array of entries
 * @param arr array of entries
 * @return array with added properties
 */
function add(arr) {
  for (var i=0; i<arr.length; i++) {
    arr[i].imported = true;
  }
  return arr;
}

co(function* () {
  // Create output directory if it does not yet exist
  try {
    yield fs.mkdir(__dirname+'/output');
  }
  catch (e) {
    if (e.code === 'EEXIST') {
      console.log('Output directory already exists. Moving on.');
    }
  }

  // Write first '[' to file
  yield fs.writeFile(__dirname + '/output/locations.json', '[');

  var separator = '';
  for (var i=1; i<6; i++) {
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
        headers: {'Accept': 'application/json'}});
      var locations = add(filter(JSON.parse(locresults.body)));

      // Add GPS coordinates to locations
      for (var j=0; j<locations.length; j++) {
        var l = locations[j];

        // Do not waste bandwidth on entries with incomplete data
        if (l.address1 === undefined || l.city === undefined || l.region === undefined) {
          continue;
        }

        // Use MapQuest Open's Geocoding API
        var qry_str = encodeURIComponent(util.format('%s %s, %s', l.address1, l.city, l.region));
        var url = util.format('http://open.mapquestapi.com/nominatim/v1/search?q=%s&format=json', qry_str);
        console.log(url);

        // Store location as a GeoJSON Point object http://geojson.org/geojson-spec.html#id2
        var gpsresults = yield request.get({url: url, headers: {'User-Agent': 'VeganSocietyCrawler'}});
        var gpsbody = JSON.parse(gpsresults.body);
        if (gpsbody.length > 0) {
          l.coordinates = {
              type: "Point"
            , coordinates: [parseFloat(gpsbody[0].lon, 10), parseFloat(gpsbody[0].lat, 10)]
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

  // Write last ']' to file
  yield fs.appendFile(__dirname + '/output/locations.json', ']');
})();
