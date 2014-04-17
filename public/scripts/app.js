var /*angular        = require('angular')
  ,*/ entryControllers = require('./entry-controllers')
  , mapControllers = require('./map-controllers')
  , interpolate    = require('./interpolate')
  ;

var mapApp = angular.module('mapApp', [
    'ngRoute'
  , 'interpolate'
  , 'mapControllers'
  , 'entryControllers'
]);

mapApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/locations/:id', {
            templateUrl: '/templates/entry.html'
          , controller: 'EntryCtrl'
        })
        .when('/', {
            templateUrl: '/templates/map.html'
          , controller: 'MapCtrl'
        }) 
        /*.otherwise({
          redirectTo: '/'
        })*/;
      
      // Remove '#' from URLs if browser supports HTML5 History API
      if (window.history && window.history.pushState) {
        $locationProvider.html5Mode(true);
      }
    }
]);

