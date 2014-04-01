var mapApp = angular.module('mapApp', [
    'ngRoute'
  , 'interpolate'
  , 'mapControllers'
]);

mapApp.config(['$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: '/templates/map.html',
          controller: 'MapCtrl'
        }) 
        .otherwise({
          redirectTo: '/'
        });
    }
]);
