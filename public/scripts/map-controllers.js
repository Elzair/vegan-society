var bounceMarker  = require('./bouncemarker')
  , haversine     = require('haversine')
  , L             = require('leaflet')
  , _             = require('underscore')
  ;

var mapControllers = angular.module('mapControllers', [
  /*  'directives'
  , */'mapServices'
]);

mapControllers.controller('MapCtrl', ['$scope', 'Locations',
    function($scope, Locations) {
      // Initialize map
      var map = L.map('map');
      L.tileLayer('https://{s}.tiles.mapbox.com/v3/elzair.hod9j49e/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">MapBox</a>',
          maxZoom: 18
      }).addTo(map);

      // Initialize list of locations
      $scope.locations = [];

      // Initialize popup template
      var template = _.template("<h2 class=\"heading <%= popup_class %>\"><%= name.en_us %></h2> <div class=\"body-content <%= popup_class %>\"><div class=\"body-text\"><p><%= short_description.en_us %></p><p id=\"distance\"><%= distance %> <%= unit %></p><a href=\"<%= hash %>/entry/<%= unique_name %>\">More info</a></div> <img class=\"popup-image\" src=\"<%= thumbnails[0] %>\" alt=\"<%= caption %>\"></div>");

      function find_nearby_locations(lat, lng) {
        // Use 64 pixels for a retina display and 32 pixels otherwise
        var width = (window.devicePixelRatio > 1) ? 64 : 32;
        var height = (window.devicePixelRatio > 1) ? 64 : 32;

        // Initialize all markers
        var restaurantMarker = L.icon({
          iconUrl: '/images/sjjb/restaurant.svg',
          iconSize: [width,height],
          popupAnchor: [0,-height/2]
        });
        var coffeeMarker = L.icon({
          iconUrl: '/images/sjjb/coffee.svg',
          iconSize: [width,height],
          popupAnchor: [0,-height/2]
        });
        var barMarker = L.icon({
          iconUrl: '/images/sjjb/bar.svg',
          iconSize: [width,height],
          popupAnchor: [0,-height/2]
        });
        var vendorMarker = L.icon({
          iconUrl: '/images/sjjb/vendor.svg',
          iconSize: [width,height],
          popupAnchor: [0,-height/2]
        });
        var groceryMarker = L.icon({
          iconUrl: '/images/sjjb/grocery.svg',
          iconSize: [width,height],
          popupAnchor: [0,-height/2]
        });
        var catererMarker = L.icon({
          iconUrl: '/images/sjjb/caterer.svg',
          iconSize: [width,height],
          popupAnchor: [0,-height/2]
        });
        var generalMarker = L.icon({
          iconUrl: '/images/sjjb/general.svg',
          iconSize: [width,height],
          popupAnchor: [0,-height/2]
        });
        var organizationMarker = L.icon({
          iconUrl: '/images/sjjb/organization.svg',
          iconSize: [width,height],
          popupAnchor: [0,0]
        });
        var hotelMarker = L.icon({
          iconUrl: '/images/sjjb/hotel.svg',
          iconSize: [width,height],
          popupAnchor: [0,0]
        });
        var otherMarker = L.icon({
          iconUrl: '/images/sjjb/other.svg',
          iconSize: [width,height],
          popupAnchor: [0,-height/2]
        });
        
        // Find locations/events around user's location
        Locations.search({lat: lat, lng: lng}).$promise.then(function(locations) {
          locations.forEach(function(loc, index, array) {
            console.log(loc);
            // Avoid adding the same location twice
            var duplicate = false;
            for (var i=0; i<$scope.locations.length; i++) {
              if ($scope.locations[i]._id === loc._id) {
                duplicate = true;
                break;
              }
            }
            if (!duplicate) {
              // Set all entry URLs to begin with '/#' if browser does not support HTML5 History API
              loc.hash = (window.history && window.history.pushState) ? '' : '/#';

              // Set which size image to use for thumbnails and what size of text to use
              loc.thumbnail = (window.devicePixelRatio > 1) ? 1 : 0;
              loc.popup_class = (window.devicePixelRatio > 1) ? 'large' : '';

              // Calculate distance from user's location
              loc.unit = (loc.country === 'USA') ? 'miles' : 'km';
              loc.distance = haversine(
                  {latitude: $scope.user_location.lat, longitude: $scope.user_location.lng}
                , {latitude: lat, longitude: lng}
                , {unit: loc.unit}
              ).toFixed(2);

              var coords = L.latLng(loc.location.coordinates[1], loc.location.coordinates[0]);
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

              console.log(loc);
              // Push location to array
              $scope.locations.push(loc);

              L.marker(coords, {bounceOnAdd: true, icon: marker})
                .addTo(map)
                .bindPopup(template(loc));
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
        $scope.user_location = e.latlng;
        var cradius = e.accuracy / 2;
        var cmradius = (window.devicePixelRation > 1) ? 16 : 18;
        L.circle(e.latlng, cradius).addTo(map);
        L.circleMarker(e.latlng, cmradius).addTo(map);

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
