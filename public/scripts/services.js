var mapServices = angular.module('mapServices', ['ngResource']);

mapServices.factory('Locations', ['$resource', 
    function($resource) {
      return $resource('http://localhost:3000/search?lat=:lat&lng=:lng', {}, {
        search: {method: 'GET', responseType: 'json', isArray: true}
      });
    }
]);
