var angularCore      = require('angular-module-core')
  , angularResource  = require('angular-module-resource')
  , angularRoute     = require('angular-module-route')
  , angularTouch     = require('angular-module-touch')
  , directives       = require('./directives')
  , entryControllers = require('./entry-controllers')
  , filters          = require('./filters')
  , interpolate      = require('./interpolate')
  , mapControllers   = require('./map-controllers')
  , slideMenu        = require('angular-slide-menu')
  ;

var mapApp = angular.module('mapApp', [
    'ngRoute'
  , 'directives'
  , 'entryControllers'
  , 'filters'
  , 'interpolate'
  , 'mapControllers'
  , 'slideMenu'
]);

mapApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/entry/:name', {
            templateUrl: '/templates/entry.html'
          , controller: 'EntryCtrl'
        })
        .when('/entry/by-id/:id', {
            templateUrl: '/templates/entry.html'
          , constroller: 'EntryByIdCtrl'
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

