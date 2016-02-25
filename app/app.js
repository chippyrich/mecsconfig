(function() {
  angular.module('mecs', ['ngRoute'])

  .config(function($routeProvider) {
    $routeProvider.when('/select', {
        templateUrl: 'app/views/select.html',
        controller: 'selCntl as select'
      })
      .when('/view', {
        templateUrl: 'app/views/view.html',
        controller: 'viewCntl as view'
      })
      .otherwise({
        redirectTo: '/select'
      });
  });

}());