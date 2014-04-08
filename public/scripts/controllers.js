var mapControllers = angular.module('mapControllers', ['mapServices']);

mapControllers.controller('MapCtrl', ['$scope', 'Locations',
    function($scope, Locations) {
      // Initialize map
      var map = L.map('map');
      L.tileLayer('http://{s}.tile.cloudmade.com/3d9c4d3562fd4e699ed3589691adcb05/997/256/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
          maxZoom: 18
      }).addTo(map);

      // Initialize list of locations
      $scope.locationIDs = [];

      function find_nearby_locations(lat, lng) {
        // Initialize all markers
        var restaurantMarker = L.icon({
          iconUrl: '/images/sjjb/restaurant.svg',
          iconSize: [64,64],
          popupAnchor: [0,0]
        });
        var coffeeMarker = L.icon({
          iconUrl: '/images/sjjb/coffee.svg',
          iconSize: [64,64],
          popupAnchor: [0,0]
        });
        var barMarker = L.icon({
          iconUrl: '/images/sjjb/bar.svg',
          iconSize: [64,64],
          popupAnchor: [0,0]
        });
        var vendorMarker = L.icon({
          iconUrl: '/images/sjjb/vendor.svg',
          iconSize: [64,64],
          popupAnchor: [0,0]
        });
        var groceryMarker = L.icon({
          iconUrl: '/images/sjjb/grocery.svg',
          iconSize: [64,64],
          popupAnchor: [0,0]
        });
        var catererMarker = L.icon({
          iconUrl: '/images/sjjb/caterer.svg',
          iconSize: [64,64],
          popupAnchor: [0,0]
        });
        var generalMarker = L.icon({
          iconUrl: '/images/sjjb/general.svg',
          iconSize: [64,64],
          popupAnchor: [0,0]
        });
        var organizationMarker = L.icon({
          iconUrl: '/images/sjjb/organization.svg',
          iconSize: [64,64],
          popupAnchor: [0,0]
        });
        var hotelMarker = L.icon({
          iconUrl: '/images/sjjb/hotel.svg',
          iconSize: [64,64],
          popupAnchor: [0,0]
        });
        var otherMarker = L.icon({
          iconUrl: '/images/sjjb/other.svg',
          iconSize: [64,64],
          popupAnchor: [0,0]
        });
        
        // Find locations/events around user's location
        Locations.search({lat: lat, lng: lng}).$promise.then(function(locations) {
          locations.forEach(function(loc, index, array) {
            // Avoid adding the same location twice
            var duplicate = false;
            for (var i=0; i<$scope.locationIDs.length; i++) {
              if ($scope.locationIDs[i] === loc._id) {
                duplicate = true;
                break;
              }
            }
            if (!duplicate) {
              // Push location ID to array
              $scope.locationIDs.push(loc._id);

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

            }
          });
        });
      }

      // Find more locations when map center changes
      map.on('dragend', function(e) {
        var center = map.getCenter();
        find_nearby_locations(center.lat, center.lng);
      });
      
      map.on('locationfound', function (e) {
        var radius = e.accuracy / 2;
        L.marker(e.latlng).addTo(map)
            .bindPopup("You are within " + radius + " meters from this point").openPopup();
        L.circle(e.latlng, radius).addTo(map);

        // Search for places near user's current location
        find_nearby_locations(e.latlng.lat, e.latlng.lng);
      });
      
      map.on('locationerror', function (e) {
        alert(e.message);
      });

      // Try to find user's current location
      map.locate({setView: true, maxZoom: 14});
    }
]);
