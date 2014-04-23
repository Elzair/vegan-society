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
        //element[0].classList.add('asm-push-left');
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
        //element[0].classList.add('asm-push-right');
      }
  };
});

slideMenu.directive('asmWrapper', function($compile) {
  return {
      restrict: 'AEC'
    , controller: function($scope, $element, $attrs) {
        this.toggleOpen = function() {
          $element[0].classList.toggle('asm-open');
          switch($attrs.push) {
            case 'top':
              $element[0].classList.toggle('asm-body-push-top');
              break;
            case 'bottom':
              $element[0].classList.toggle('asm-body-push-bottom');
              break;
            case 'left':
              $element[0].classList.toggle('asm-body-push-left');
              break;
            case 'right':
              $element[0].classList.toggle('asm-body-push-right');
              break;
            default:
              break;
          }
        };
      }
    , link: function(scope, element, attr) {
        element[0].classList.add('asm-wrapper');
        element[0].classList.add('asm-closed');
        $compile(element.contents())(scope);
      }
  };
});

slideMenu.directive('asmControl', function($document, $compile) {
  return {
      restrict: 'AEC'
    , require: '^asmWrapper'
    , link: function(scope, element, attrs, asmWrapperCtrl) {
        element[0].innerHTML = '<a href="#" class="leaflet-control leaflet-control-asm">'+element[0].innerHTML+'</a>';
        element.find('a').bind('click', function(ev) {
          ev.preventDefault();
          asmWrapperCtrl.toggleOpen();
        });
        $compile(element.contents())(scope);
      }
  };
});
