var /*angular     = require('angular')
  , */mapServices   = require('./services')
  ;

var entryControllers = angular.module('entryControllers', ['mapServices']);

entryControllers.controller('EntryCtrl', ['$scope', '$routeParams', 'LocationInfo',
    function($scope, $routeParams, LocationInfo) {
      console.log('Got to Entry control!');
      LocationInfo.get({id: $routeParams.id}).$promise.then(function(info) {
        console.log(info);
        $scope.info = info;
      });
    }
]);
