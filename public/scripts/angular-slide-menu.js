var slideMenu = angular.module('slideMenu', []);

slideMenu.directive('asmSlideLeft', function($compile) {
  return {
      restrict: 'AEC'
    , replace: true
    , link: function(scope, element, attr) {
        element[0].classList.add('asm');
        element[0].classList.add('asm-horizontal');
        element[0].classList.add('asm-left');
      }
  };
});

slideMenu.directive('asmSlideRight', function($compile) {
  return {
      restrict: 'AEC'
    , replace: true
    , link: function(scope, element, attr) {
      element[0].classList.add('asm');
      element[0].classList.add('asm-horizontal');
      element[0].classList.add('asm-right');
    }
  };
});

slideMenu.directive('asmPushLeft', function($compile) {
  return {
      restrict: 'AEC'
    , replace: true
    , link: function(scope, element, attr) {
        element[0].classList.add('asm');
        element[0].classList.add('asm-horizontal');
        element[0].classList.add('asm-left');
        element[0].classList.add('asm-push-left');
      }
  };
});

slideMenu.directive('asmPushRight', function($compile) {
  return {
      restrict: 'AEC'
    , link: function(scope, element, attr) {
        element[0].classList.add('asm');
        element[0].classList.add('asm-horizontal');
        element[0].classList.add('asm-right');
        element[0].classList.add('asm-push-right');
      }
  };
});

slideMenu.directive('asmWrapper', function($compile) {
  return {
      restrict: 'AEC'
    , controller: function($scope, $element, $attrs) {
        this.toggleOpen = function() {
          $element[0].classList.toggle('asm-open');
        };
      }
    , link: function(scope, element, attr) {
        element[0].classList.add('asm-wrapper');
        $compile(element.contents())(scope);
      }
  };
});

slideMenu.directive('asmControl', function($document, $compile) {
  return {
      restrict: 'EC'
    , require: '^asmWrapper'
    , template: '<a href="#" class="leaflet-control leaflet-control-asm"><img src="/images/menu.svg"/></a>'
    , link: function(scope, element, attrs, asmWrapperCtrl) {
        element.find('a').bind('click', function(ev) {
          console.log('Hello You!');
          ev.preventDefault();
          asmWrapperCtrl.toggleOpen();
        });
      }
  };
});
