var mapControllers = angular.module('mapControllers', ['mapServices']);

mapControllers.controller('MapCtrl', ['$scope', 'Locations',
    function($scope, Locations) {
      var map = L.map('map');
      L.tileLayer('http://{s}.tile.cloudmade.com/3d9c4d3562fd4e699ed3589691adcb05/997/256/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
          maxZoom: 18
      }).addTo(map);
      function onLocationFound(e) {
          var radius = e.accuracy / 2;
          L.marker(e.latlng).addTo(map)
              .bindPopup("You are within " + radius + " meters from this point").openPopup();
          L.circle(e.latlng, radius).addTo(map);

          // Initialize all markers
          var restaurantMarker = L.AwesomeMarkers.icon({
            icon: 'cutlery',
            prefix: 'fa',
            markerColor: 'red'
          });
          var coffeeMarker = L.AwesomeMarkers.icon({
            icon: 'coffee',
            prefix: 'fa',
            markerColor: 'darkred'
          });
          var barMarker = L.AwesomeMarkers.icon({
            icon: 'beer',
            prefix: 'fa',
            markerColor: 'orange'
          });
          var vendorMarker = L.AwesomeMarkers.icon({
            icon: 'truck',
            prefix: 'fa',
            markerColor: 'green'
          });
          var groceryMarker = L.AwesomeMarkers.icon({
            icon: 'shopping-cart',
            prefix: 'fa',
            markerColor: 'darkgreen'
          });
          var catererMarker = L.AwesomeMarkers.icon({
            icon: 'user',
            prefix: 'fa',
            markerColor: 'blue'
          });
          var generalMarker = L.AwesomeMarkers.icon({
            icon: 'money',
            prefix: 'fa',
            markerColor: 'purple'
          });
          var organizationMarker = L.AwesomeMarkers.icon({
            icon: 'group',
            prefix: 'fa',
            markerColor: 'darkpurple'
          });
          var hotelMarker = L.AwesomeMarkers.icon({
            icon: 'home',
            prefix: 'fa',
            markerColor: 'cadetblue'
          });
          var otherMarker = L.AwesomeMarkers.icon({
            icon: 'question',
            prefix: 'fa',
            markerColor: 'blue'
          });
          
          // Find locations/events around user's location
          Locations.search({lat: e.latlng.lat, lng: e.latlng.lng}).$promise.then(function(locations) {
            locations.forEach(function(loc, index, array) {
              var coords = L.latLng(loc.coordinates.coordinates[1], loc.coordinates.coordinates[0]);
              var marker = null;
              switch(loc.categories[0]) {
                case 'Restaurant':
                  marker = restaurantMarker;
                  break;
                case 'Coffee/Tea/Juice':
                  marker = coffeeMarker;
                  break;
                case 'Bar':
                  marker = barMarker;
                  break;
                case 'Food Court or Street Vendor':
                  marker = vendorMarker;
                  break;
                case 'Grocery/Bakery/Deli':
                  marker = groceryMarker;
                  break;
                case 'Caterer':
                  marker = catererMarker;
                  break;
                case 'General Store':
                  marker = generalMarker;
                  break;
                case 'Organization':
                  marker = organizationMarker;
                  break;
                case 'Hotel/B&B':
                  marker = hotelMarker;
                  break;
                case 'Other':
                  marker = otherMarker;
                  break;
                default:
                  marker = otherMarker;
                  break;
              }
              L.marker(coords, {bounceOnAdd: true, icon: marker}).addTo(map)
                .bindPopup(JSON.stringify(loc));
            });
          });
      }
      map.on('locationfound', onLocationFound);
      function onLocationError(e) {
          alert(e.message);
      }
      map.on('locationerror', onLocationError);
      map.locate({setView: true, maxZoom: 14});
    }
]);
