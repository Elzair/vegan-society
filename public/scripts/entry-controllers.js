var carousel       = require('./angular-carousel')
  ;

var entryControllers = angular.module('entryControllers', ['angular-carousel', 'mapServices']);

entryControllers.controller('EntryCtrl', ['$scope', '$routeParams', '$sce', 'EntryInfo',
    function($scope, $routeParams, $sce, EntryInfo) {
      EntryInfo.get({name: $routeParams.name}).$promise.then(function(info) {
        info.address = (info.address2 !== undefined) ? info.address1.en_us + ', ' + info.address2.en_us : info.address1.en_us;
        $scope.info = info;
        $scope.description = $sce.trustAsHtml(info.long_description.en_us['text/html']);
      });
    }
]);

entryControllers.controller('EntryByIdCtrl', ['$scope', '$routeParams', '$sce', 'EntryInfoById',
    function($scope, $routeParams, $sce, EntryInfoById) {
      EntryInfoById.get({id: $routeParams.id}).$promise.then(function(info) {
        info.address = (info.address2 !== undefined) ? info.address1.en_us + ', ' + info.address2.en_us : info.address1.en_us;
        $scope.info = info;
        $scope.description = $sce.trustAsHtml(info.long_description.en_us['text/html']);
      });
    }
]);
