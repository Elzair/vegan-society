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
          
          // Find locations/events around user's location
          $scope.results = Locations.search({latitude: e.latlng.lat, longitude: e.latlng.lng});
      }
      map.on('locationfound', onLocationFound);
      function onLocationError(e) {
          alert(e.message);
      }
      map.on('locationerror', onLocationError);
      map.locate({setView: true, maxZoom: 16});
    }
]);
