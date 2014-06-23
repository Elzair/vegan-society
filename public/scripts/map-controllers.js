var bounceMarker     = require('./bouncemarker')
  , haversine        = require('haversine')
  , leaflet          = require('leaflet')
  , _                = require('underscore')
  ;

var mapControllers = angular.module('mapControllers', [
    'leaflet-directive'
  , 'mapServices'
]);

mapControllers.controller('MapCtrl', ['$scope', 'Entries', 'leafletEvents',
    function($scope, Entries, leafletEvents) {
      L.Icon.Default.imagePath = '/images';
      
      // Initialize popup template
      var template = _.template("<h2 class=\"heading <%= popup_class %>\"><%= name.en_us %></h2> <div class=\"body-content <%= popup_class %>\"><div class=\"body-text\"><p><%= short_description.en_us %></p><p id=\"distance\"><%= distance %> <%= unit %></p><a href=\"<%= hash %>/entry/<%= unique_name %>\">More info</a></div> <img class=\"popup-image\" src=\"<%= thumbnails[0] %>\" alt=\"<%= caption %>\"></div>");

      angular.extend($scope, {
          // Use 64 pixels for a retina display and 32 pixels otherwise
          width: (window.devicePixelRatio > 1) ? 64 : 40
        , height: (window.devicePixelRatio > 1) ? 64 : 40
        , zoom: 10
      });
      angular.extend($scope, {
          // Initialize map
          tiles: {
              url: 'https://{s}.tiles.mapbox.com/v3/elzair.hod9j49e/{z}/{x}/{y}.png'
            , options: {
                attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">MapBox</a>'
              }
          }

          // Center map on user's location
        , center: {
              autoDiscover: true
            , zoom: $scope.zoom
          }

          // Initialize list of locations/events
        , entries: {}

          // Initialize all icons
        , icons: {
              restaurantIcon: {
                iconUrl: '/images/sjjb/restaurant.svg',
                iconSize: [$scope.width,$scope.height],
                popupAnchor: [$scope.width/2-15,-1*$scope.height]
              }
            , coffeeIcon: {
                iconUrl: '/images/sjjb/coffee.svg',
                iconSize: [$scope.width,$scope.height],
                popupAnchor: [$scope.width/2-15,-1*$scope.height]
              }
            , barIcon: {
                iconUrl: '/images/sjjb/bar.svg',
                iconSize: [$scope.width,$scope.height],
                popupAnchor: [$scope.width/2-15,-1*$scope.height]
              }
            , vendorIcon: {
                iconUrl: '/images/sjjb/vendor.svg',
                iconSize: [$scope.width,$scope.height],
                popupAnchor: [$scope.width/2-15,-1*$scope.height]
              }
            , groceryIcon: {
                iconUrl: '/images/sjjb/grocery.svg',
                iconSize: [$scope.width,$scope.height],
                popupAnchor: [$scope.width/2-15,-1*$scope.height]
              }
            , catererIcon: {
                iconUrl: '/images/sjjb/caterer.svg',
                iconSize: [$scope.width,$scope.height],
                popupAnchor: [$scope.width/2-15,-1*$scope.height]
              }
            , generalIcon: {
                iconUrl: '/images/sjjb/general.svg',
                iconSize: [$scope.width,$scope.height],
                popupAnchor: [$scope.width/2-15,-1*$scope.height]
              }
            , organizationIcon: {
                iconUrl: '/images/sjjb/organization.svg',
                iconSize: [$scope.width,$scope.height],
                popupAnchor: [$scope.width/2-15,-1*$scope.height]
              }
            , hotelIcon: {
                iconUrl: '/images/sjjb/hotel.svg',
                iconSize: [$scope.width,$scope.height],
                popupAnchor: [$scope.width/2-15,-1*$scope.height]
              }
            , otherIcon: {
                iconUrl: '/images/sjjb/other.svg',
                iconSize: [$scope.width,$scope.height],
                popupAnchor: [$scope.width/2-15,-1*$scope.height]
              }
          }

          // Initialize set of markers
        , markers: {}

        , paths: {}
      });

      function find_nearby_locations(lat, lng) {
        // Find locations/events around specified location
        Entries.search({lat: lat, lng: lng}).$promise.then(function(entries) {
          entries.forEach(function(ent, index, array) {
            // Avoid adding the same location twice
            var duplicate = $scope.entries.hasOwnProperty(ent.unique_name) ? true : false;
            if (!duplicate) {
              // Set all entry URLs to begin with '/#' if browser does not support HTML5 History API
              ent.hash = (window.history && window.history.pushState) ? '' : '/#';

              // Set which size image to use for thumbnails and what size of text to use
              ent.thumbnail = (window.devicePixelRatio > 1) ? 1 : 0;
              ent.popup_class = (window.devicePixelRatio > 1) ? 'large' : '';

              // Calculate distance from user's location
              ent.unit = (ent.country === 'USA') ? 'miles' : 'km';

              ent.distance = haversine(
                  {latitude: $scope.user_location.lat, longitude: $scope.user_location.lng}
                , {latitude: ent.location.coordinates[1], longitude: ent.location.coordinates[0]}
                , {unit: ent.unit}
              ).toFixed(2);

              var icon = null;
              switch(ent.categories[0]) {
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

              console.log(ent);
              // Add entry to entries object
              $scope.entries[ent.unique_name] = ent;

              // Add marker to map
              $scope.markers[ent._id] = {
                  lat: ent.location.coordinates[1]
                , lng: ent.location.coordinates[0] 
                , icon: icon
                , draggable: false
                , message: template(ent)
                , bounceOnAdd: true // Fix non-bouncing marker
              };
            }
          });
        });
      }

      // Find more locations when map center changes
      $scope.$on('leafletDirectiveMap.dragend', function(e, args) {
        var center = e.currentScope.center;
        find_nearby_locations(center.lat, center.lng);
      });
      
      $scope.$on('leafletDirectiveMap.locationfound', function (e, args) {
        angular.extend($scope, {
            user_location:  args.leafletEvent.latlng
          , paths: {
                circle: {
                    type: 'circle'
                  , radius: args.leafletEvent.accuracy / 2
                  , latlngs: args.leafletEvent.latlng
                }
              , circleMarker: {
                    type: 'circleMarker'
                  , radius: (window.devicePixelRation > 1) ? 16 : 18
                  , latlngs: args.leafletEvent.latlng
                }
            }
        });

        // Search for places near user's current location
        find_nearby_locations(args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng);
      });

      // Center clicked marker
      $scope.$on('leafletDirectiveMap.popupopen', function(e, args) {
        console.log(args);
        $scope.center = {
            lat: args.leafletEvent.popup._latlng.lat
          , lng: args.leafletEvent.popup._latlng.lng
          , zoom: $scope.zoom
        };
      });

      // Save zoom level
      $scope.$on('leafletDirectiveMap.zoomend', function(e, args) {
        $scope.zoom = args.leafletEvent.target._zoom;
      });
      
      $scope.$on('leafletDirectiveMap.locationerror', function (e, args) {
        alert(e.message);
      });
    }
]);
