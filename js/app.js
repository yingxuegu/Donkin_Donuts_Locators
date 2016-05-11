var dd = angular.module('ddLocators', ['ui.bootstrap', 'leaflet-directive', 'ddCtrl', 'ddService', 'ngRoute']);
// config routes
dd.config(['$routeProvider', '$locationProvider',
  function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'map.html'
      });
}]);




