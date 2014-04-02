var co = require('co')
  , fs      = require('co-fs')
  , request = require('co-request')
  , util    = require('util')
  ;


co(function* () {
  var entries = [];
  //Get method
  for (var i=1; i<10; i++) {
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
      var locations = JSON.parse(locresults.body);
      entries = entries.concat(locations);
    }
  }
  var places = util.format('%j', entries);
  console.log(places);
  yield fs.writeFile('places.json', places);
})();
