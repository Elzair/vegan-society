var /*angular     = require('angular')
  , */carousel       = require('./angular-carousel')
  , mapServices   = require('./services')
  ;

var entryControllers = angular.module('entryControllers', ['angular-carousel', 'mapServices']);

entryControllers.controller('EntryCtrl', ['$scope', '$routeParams', '$sce', 'LocationInfo',
    function($scope, $routeParams, $sce, LocationInfo) {
      LocationInfo.get({id: $routeParams.id}).$promise.then(function(info) {
        info.address = (info.address2 !== undefined) ? info.address1 + ', ' + info.address2 : info.address1;
        $scope.info = info;
        $scope.description = $sce.trustAsHtml(info.long_description['text/html']);
      });
    }
]);
