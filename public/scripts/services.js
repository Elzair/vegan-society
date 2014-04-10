var angular = require('angular');

var mapServices = angular.module('mapServices', ['ngResource']);

mapServices.factory('Locations', ['$resource', 
    function($resource) {
      var host = document.querySelector("#host").innerHTML;
      console.log(host);
      return $resource('http://' + host + '/search?lat=:lat&lng=:lng', {}, {
        search: {method: 'GET', responseType: 'json', isArray: true}
      });
    }
]);
