var /*angular     = require('angular')
  ,*/ L           = require('leaflet')
  , bounceMarker  = require('./bouncemarker')
  , mapServices   = require('./services')
  , _             = require('underscore')
  ;

var mapControllers = angular.module('mapControllers', ['mapServices']);

mapControllers.controller('MapCtrl', ['$scope', 'Locations',
    function($scope, Locations) {
      // Initialize map
      var map = L.map('map');
      L.tileLayer('https://{s}.tiles.mapbox.com/v3/elzair.hod9j49e/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">MapBox</a>',
          maxZoom: 18
      }).addTo(map);

      // Initialize list of locations
      $scope.locationIDs = [];

      // Initialize popup template
      var template = _.template("<h2 id=\"firstHeading\" class=\"firstHeading <%= popup_class %>\"><%= name %></h2> <div class=\"bodyContent <%= popup_class %>\"><div class=\"bodyText\"><p><%= short_description %></p> <p id=\"address1\"><%= address1 %><% if (typeof address2 !== \"undefined\") { %>, <%= address2 %><% } %></p> <p id=\"address2\"><%= city %>, <%= region %> <%= postal_code %>, <%= country %></p><a href=\"<%= hash %>/locations/<%= _id %>\">More info</a></div> <img class=\"popup-image\" src=\"<%= images[0].files[thumbnail].uri %>\" alt=\"<%= images[0].caption %>\"></div>");

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
          popupAnchor: [0,0]
        });
        var barMarker = L.icon({
          iconUrl: '/images/sjjb/bar.svg',
          iconSize: [width,height],
          popupAnchor: [0,0]
        });
        var vendorMarker = L.icon({
          iconUrl: '/images/sjjb/vendor.svg',
          iconSize: [width,height],
          popupAnchor: [0,0]
        });
        var groceryMarker = L.icon({
          iconUrl: '/images/sjjb/grocery.svg',
          iconSize: [width,height],
          popupAnchor: [0,-height/2]
        });
        var catererMarker = L.icon({
          iconUrl: '/images/sjjb/caterer.svg',
          iconSize: [width,height],
          popupAnchor: [0,0]
        });
        var generalMarker = L.icon({
          iconUrl: '/images/sjjb/general.svg',
          iconSize: [width,height],
          popupAnchor: [0,0]
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

              // Set all entry URLs to begin with '/#' if browser does not support HTML5 History API
              loc.hash = (window.history && window.history.pushState) ? '' : '/#';

              // Set which size image to use for thumbnails and what size of text to use
              loc.thumbnail = (window.devicePixelRatio > 1) ? 1 : 0;
              loc.popup_class = (window.devicePixelRatio > 1) ? 'large' : '';

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

              console.log(loc);
              L.marker(coords, {bounceOnAdd: true, icon: marker}).addTo(map)
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
        var cradius = e.accuracy / 2;
        var cmradius = (window.devicePixelRation > 1) ? 16 : 18;
        // Set default image path so Leaflet will show default marker
        //L.Icon.Default.imagePath = '/images';
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
