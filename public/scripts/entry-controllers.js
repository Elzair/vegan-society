var /*angular     = require('angular')
  , */mapServices   = require('./services')
  ;

var entryControllers = angular.module('entryControllers', ['mapServices']);

entryControllers.controller('EntryCtrl', ['$scope', '$routeParams', '$sce', 'LocationInfo',
    function($scope, $routeParams, $sce, LocationInfo) {
      console.log('Got to Entry control!');
      LocationInfo.get({id: $routeParams.id}).$promise.then(function(info) {
        console.log(info);
        info.address = (info.address2 !== undefined) ? info.address1 + ', ' + info.address2 : info.address1;
        $scope.info = info;
        $scope.description = $sce.trustAsHtml(info.long_description['text/html']);
      });
    }
]);
