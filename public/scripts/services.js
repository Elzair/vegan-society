var mapServices = angular.module('mapServices', ['ngResource']);

mapServices.factory('Entries', ['$resource', 
    function($resource) {
      var host = document.querySelector("#host").innerHTML;
      return $resource('https://' + host + '/api/v1/search?lat=:lat&lng=:lng', {}, {
        search: {method: 'GET', responseType: 'json', isArray: true}
      });
    }
]);

mapServices.factory('EntryInfo', ['$resource',
    function($resource) {
      var host = document.querySelector("#host").innerHTML;
      return $resource('https://' + host + '/api/v1/entry/:name', {}, {
        get: {method: 'GET', responseType: 'json'}
      });
    }
]);

mapServices.factory('EntryInfoById', ['$resource',
    function($resource) {
      var host = document.querySelector("#host").innerHTML;
      return $resource('https://' + host + '/api/v1/entry/by-id/:id', {}, {
        get: {method: 'GET', responseType: 'json'}
      });
    }
]);
