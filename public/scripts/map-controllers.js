var bounceMarker     = require('./bouncemarker')
  , haversine        = require('haversine')
  , leaflet          = require('leaflet')
  //, leafletDirective = require('angular-leaflet-directive')
  , _                = require('underscore')
  ;

var mapControllers = angular.module('mapControllers', [
  /*  'directives'
  , */'leaflet-directive'
  , 'mapServices'
]);

mapControllers.controller('MapCtrl', ['$scope', 'Locations', 'leafletEvents',
    function($scope, Locations, leafletEvents) {
      L.Icon.Default.imagePath = '/images';

      // Initialize map
      $scope.defaults = {
          tileLayers: 'https://{s}.tiles.mapbox.com/v3/elzair.hod9j49e/{z}/{x}/{y}.png'
        , attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">MapBox</a>'
        , maxZoom: 18
      };

      console.log(leafletEvents.getAvailableMapEvents());

      // Center map on user's location
      $scope.center = {autoDiscover: true};

      // Initialize list of locations
      $scope.locations = [];

      // Initialize popup template
      var template = _.template("<h2 class=\"heading <%= popup_class %>\"><%= name.en_us %></h2> <div class=\"body-content <%= popup_class %>\"><div class=\"body-text\"><p><%= short_description.en_us %></p><p id=\"distance\"><%= distance %> <%= unit %></p><a href=\"<%= hash %>/entry/<%= unique_name %>\">More info</a></div> <img class=\"popup-image\" src=\"<%= thumbnails[0] %>\" alt=\"<%= caption %>\"></div>");

      // Use 64 pixels for a retina display and 32 pixels otherwise
      $scope.width = (window.devicePixelRatio > 1) ? 64 : 32;
      $scope.height = (window.devicePixelRatio > 1) ? 64 : 32;

      // Initialize all icons
      $scope.icons = {
          restaurantIcon: {
            iconUrl: '/images/sjjb/restaurant.svg',
            iconSize: [$scope.width,$scope.height],
            popupAnchor: [0,-1*$scope.height/2]
          }
        , coffeeIcon: {
            iconUrl: '/images/sjjb/coffee.svg',
            iconSize: [$scope.width,$scope.height],
            popupAnchor: [0,-1*$scope.height/2]
          }
        , barIcon: {
            iconUrl: '/images/sjjb/bar.svg',
            iconSize: [$scope.width,$scope.height],
            popupAnchor: [0,-1*$scope.height/2]
          }
        , vendorIcon: {
            iconUrl: '/images/sjjb/vendor.svg',
            iconSize: [$scope.width,$scope.height],
            popupAnchor: [0,-1*$scope.height/2]
          }
        , groceryIcon: {
            iconUrl: '/images/sjjb/grocery.svg',
            iconSize: [$scope.width,$scope.height],
            popupAnchor: [0,-1*$scope.height/2]
          }
        , catererIcon: {
            iconUrl: '/images/sjjb/caterer.svg',
            iconSize: [$scope.width,$scope.height],
            popupAnchor: [0,-1*$scope.height/2]
          }
        , generalIcon: {
            iconUrl: '/images/sjjb/general.svg',
            iconSize: [$scope.width,$scope.height],
            popupAnchor: [0,-$scope.height/2]
          }
        , organizationIcon: {
            iconUrl: '/images/sjjb/organization.svg',
            iconSize: [$scope.width,$scope.height],
            popupAnchor: [0,0]
          }
        , hotelIcon: {
            iconUrl: '/images/sjjb/hotel.svg',
            iconSize: [$scope.width,$scope.height],
            popupAnchor: [0,0]
          }
        , otherIcon: {
            iconUrl: '/images/sjjb/other.svg',
            iconSize: [$scope.width,$scope.height],
            popupAnchor: [0,-1*$scope.height/2]
          }
      };

      // Initialize set of markers
      $scope.markers = {};

      function find_nearby_locations(lat, lng) {
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

              //var coords = L.latLng(loc.location.coordinates[1], loc.location.coordinates[0]);
              var icon = null;
              switch(loc.categories[0]) {
                case 'Restaurant':
                  icon = $scope.icons.restaurantIcon;
                  break;
                case 'Coffee/Tea/Juice':
                  icon = $scope.icons.coffeeIcon;
                  break;
                case 'Bar':
                  icon = $scope.icons.barIcon;
                  break;
                case 'Food Court or Street Vendor':
                  icon = $scope.icons.vendorIcon;
                  break;
                case 'Grocery/Bakery/Deli':
                  icon = $scope.icons.groceryIcon;
                  break;
                case 'Caterer':
                  icon = $scope.icons.catererIcon;
                  break;
                case 'General Store':
                  icon = $scope.icons.generalIcon;
                  break;
                case 'Organization':
                  icon = $scope.icons.organizationIcon;
                  break;
                case 'Hotel/B&B':
                  icon = $scope.icons.hotelIcon;
                  break;
                case 'Other':
                  icon = $scope.icons.otherIcon;
                  break;
                default:
                  icon = $scope.icons.otherIcon;
                  break;
              }

              console.log(loc);
              // Push location to array
              $scope.locations.push(loc);

              //var marker = L.marker(coords, {bounceOnAdd: true, icon: icon});
              //marker.bindPopup(template(loc));
              $scope.markers[loc._id] = {
                  lat: loc.location.coordinates[1]
                , lng: loc.location.coordinates[0] 
                , icon: icon
                , draggable: false
                , message: template(loc)
              };
            }
          });
        });
      }

      // Find more locations when map center changes
      $scope.$on('leafletDirectiveMap.dragend', function(e, args) {
        console.log(e);
        console.log(args);
        //var center = map.getCenter();
        //find_nearby_locations(center.lat, center.lng);
      });
      
      $scope.$on('leafletDirectiveMap.locationfound', function (e, args) {
        console.log(e);
        console.log(args);
        $scope.user_location = args.leafletEvent.latlng;
        var cradius = args.leafletEvent.accuracy / 2;
        var cmradius = (window.devicePixelRation > 1) ? 16 : 18;
        //L.circle(e.latlng, cradius).addTo(map);
        //L.circleMarker(e.latlng, cmradius).addTo(map);

        // Search for places near user's current location
        find_nearby_locations(args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng);
      });
      
      $scope.$on('leafletDirectiveMap.locationerror', function (e, args) {
        alert(e.message);
      });

      //// Try to find user's current location
      //map.locate({setView: true, maxZoom: 14});
    }
]);
