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
          var restaurantMarker = L.MakiMarkers.icon({
            icon: 'restaurant',
            color: '#d00',
            size: 'l'
          });
          var coffeeMarker = L.MakiMarkers.icon({
            icon: 'coffee',
            color: '#800',
            size: 'l'
          });
          var barMarker = L.MakiMarkers.icon({
            icon: 'beer',
            color: '#f80',
            size: 'l'
          });
          var vendorMarker = L.MakiMarkers.icon({
            icon: 'bus',
            color: '#0c0',
            size: 'l'
          });
          var groceryMarker = L.MakiMarkers.icon({
            icon: 'grocery',
            color: '#080',
            size: 'l'
          });
          var catererMarker = L.MakiMarkers.icon({
            icon: 'mobilephone',
            color: '#36f',
            size: 'l'
          });
          var generalMarker = L.MakiMarkers.icon({
            icon: 'commercial',
            color: '#c0c',
            size: 'l'
          });
          var organizationMarker = L.MakiMarkers.icon({
            icon: 'building',
            color: '#808',
            size: 'l'
          });
          var hotelMarker = L.MakiMarkers.icon({
            icon: 'lodging',
            color: '#00f',
            size: 'l'
          });
          var otherMarker = L.MakiMarkers.icon({
            icon: 'marker',
            color: '#000',
            size: 'l'
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
