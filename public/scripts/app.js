var /*angular        = require('angular')
  , */carousel       = require('./angular-carousel')
  , entryControllers = require('./entry-controllers')
  , filters        = require('./filters')
  , interpolate    = require('./interpolate')
  , mapControllers = require('./map-controllers')
  ;

var mapApp = angular.module('mapApp', [
    'ngRoute'
  , 'angular-carousel'
  , 'entryControllers'
  , 'filters'
  , 'interpolate'
  , 'mapControllers'
]);

mapApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/location/:id', {
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

