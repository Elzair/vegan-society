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

mapControllers.controller('MapCtrl', ['$scope', 'Entries', 'leafletEvents',
    function($scope, Entries, leafletEvents) {
      L.Icon.Default.imagePath = '/images';

      // Initialize popup template
      var template = _.template("<h2 class=\"heading <%= popup_class %>\"><%= name.en_us %></h2> <div class=\"body-content <%= popup_class %>\"><div class=\"body-text\"><p><%= short_description.en_us %></p><p id=\"distance\"><%= distance %> <%= unit %></p><a href=\"<%= hash %>/entry/<%= unique_name %>\">More info</a></div> <img class=\"popup-image\" src=\"<%= thumbnails[0] %>\" alt=\"<%= caption %>\"></div>");

      angular.extend($scope, {
          // Use 64 pixels for a retina display and 32 pixels otherwise
          width: (window.devicePixelRatio > 1) ? 64 : 40
        , height: (window.devicePixelRatio > 1) ? 64 : 40
      });
      angular.extend($scope, {
          // Initialize map
          tiles: {
              url: 'https://{s}.tiles.mapbox.com/v3/elzair.hod9j49e/{z}/{x}/{y}.png'
            , options: {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">MapBox</a>'
              }
          }

          // Center map on user's location
        , center: {
              autoDiscover: true
            , zoom: 10
          }

          // Initialize list of locations/events
        , entries: []

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
      });

      function find_nearby_locations(lat, lng) {
        // Find locations/events around user's location
        Entries.search({lat: lat, lng: lng}).$promise.then(function(entries) {
          entries.forEach(function(ent, index, array) {
            console.log(ent);
            // Avoid adding the same location twice
            var duplicate = false;
            for (var i=0; i<$scope.entries.length; i++) {
              if ($scope.entries[i]._id === ent._id) {
                duplicate = true;
                break;
              }
            }
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
                , {latitude: lat, longitude: lng}
                , {unit: ent.unit}
              ).toFixed(2);

              //var coords = L.latLng(loc.location.coordinates[1], loc.location.coordinates[0]);
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
              // Push location to array
              $scope.entries.push(ent);

              // Add marker to map
              $scope.markers[ent._id] = {
                  lat: ent.location.coordinates[1]
                , lng: ent.location.coordinates[0] 
                , icon: icon
                , draggable: false
                , message: template(ent)
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
                  , latlngs: $scope.user_location
                }
              , circleMarker: {
                    type: 'circleMarker'
                  , radius: (window.devicePixelRation > 1) ? 16 : 18
                  , latlngs: $scope.user_location
                }
            }
        });
        // Search for places near user's current location
        find_nearby_locations($scope.user_location.lat, $scope.user_location.lng);
      });
      
      $scope.$on('leafletDirectiveMap.locationerror', function (e, args) {
        alert(e.message);
      });
    }
]);
