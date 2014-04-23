var directives = angular.module('directives', []);

directives.directive('vsPopup', function($compile) {
  return {
      restrict: 'AEC'
    , templateUrl: '/templates/popup.html'
    , link: function(scope, element, attr) {
        console.log(attr);
        var loc_id = parseInt(attr.location, 10);
        scope.info = scope.locations[loc_id];
        $compile(element.contents())(scope);
      }
  };
});
