var co = require('co')
  , fs      = require('co-fs')
  , request = require('co-request')
  ;

function filter_vegan(arr) {
  var results = [];
  arr.forEach(function(element, index, array) {
    if (element.veg_level_description === 'Vegan') {
      results.push(element);
    }
  });
  return results;
}

co(function* () {
  // Write first '[' to file
  yield fs.writeFile('locations.json', '[');
  var separator = '\n';
  for (var i=1; i<3000; i++) {
    var results = yield request.get({url: 'http://www.vegguide.org/region/'+i.toString(), 
      headers: {'Accept': 'application/json'}});
    var region = JSON.parse(results.body);
    if (region.hasOwnProperty('regions')) {
      console.log('Reached last region!');
      break;
    }
    if (parseInt(region.entry_count, 10) > 0) {
      var locresults = yield request.get({url: 'http://www.vegguide.org/region/'+i.toString()+'/entries', 
        headers: {'Accept': 'application/json'}});
      var locations = filter_vegan(JSON.parse(locresults.body));
      var output = JSON.stringify(locations, null, 2);
      output = separator + output.substring(2, output.length-2);
      separator = ',\n';
      yield fs.appendFile('locations.json', output);
      console.log(output);
    }
  }
  // Write last ']' to file
  yield fs.appendFile('locations.json', '\n]');
})();
