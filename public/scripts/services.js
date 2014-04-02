var mapServices = angular.module('mapServices', ['ngResource']);

mapServices.factory('Locations', ['$resource', 
    function($resource) {
      return $resource('http://www.vegguide.org/search/by-lat-long/:latitude,:longitude/filter/veg_level=5', {}, {
        search: {method: 'GET', responseType: 'json'}
      });
    }
]);
