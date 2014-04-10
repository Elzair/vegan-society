var angular = require('angular');

var interpolate = angular.module('interpolate', [], function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});
