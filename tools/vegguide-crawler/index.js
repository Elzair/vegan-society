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
 * @param idnum next id number to use
 * @return array with added properties
 */
function add(arr, idnum) {
  for (var i=0; i<arr.length; i++) {
    arr[i].id = idnum++;
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

  var separator = '\n', idnum = 1;
  for (var i=1; i<10; i++) {
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
      var locations = add(filter(JSON.parse(locresults.body)), idnum);
      idnum += locations.length;

      // Add GPS coordinates to locations
      for (var j=0; j<locations.length; j++) {
        var l = locations[j];
        var qry_str = encodeURIComponent(util.format('%s %s, %s', l.address1, l.city, l.region));
        var url = util.format('http://nominatim.openstreetmap.org/search?q=%s&format=json&polygon=1&addressdetails=1', qry_str);
        console.log(url);
        var gpsresults = yield request.get({url: url});
        var gpsbody = JSON.parse(gpsresults.body);
        if (gpsbody.length > 0) {
          locations[j].lat = gpsbody[0].lat;
          locations[j].lng = gpsbody[0].lon;
        }
      }

      var output = JSON.stringify(locations, null, 2);
      // Strip first "[\n" and last "\n]" from output
      output = separator + output.substring(2, output.length-2);
      separator = ',\n';
      yield fs.appendFile(__dirname + '/output/locations.json', output);
    }
  }

  // Write last ']' to file
  yield fs.appendFile(__dirname + '/output/locations.json', '\n]');
})();
