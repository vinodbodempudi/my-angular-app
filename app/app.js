'use strict';

var app = angular.module('fatHomesApp', [
  'ngCookies',
  'ngSanitize',
  'ngRoute',
  'ngResource',
  'registerProperty',
  'home'
]);
  
app.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'LoginCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/form', {
        templateUrl: 'views/form.html',
        controller: 'LoginCtrl'
      })
      .when('/login', {
        templateUrl: 'views/main.html',
        controller: 'LoginCtrl'
      })


      .when('/newlogin', {
        templateUrl: 'modules/login/html/login.html',
        controller: 'LoginCtrl'
      })
      .when('/home', {
        templateUrl: 'modules/registerProperty/html/home.html',
        controller: 'HomeCtrl'
      })
      .when('/propertyDetails', {
        templateUrl: 'modules/propertydetails/html/property-details.html',
        controller: 'PropertyDetailsCtrl'
      })
      .when('/registerProperty', {
        templateUrl: 'modules/registerProperty/html/register-property.html',
        controller: 'RegisterPropertyCtrl'
      })


      .otherwise({
        redirectTo: '/'
      });
  });

 app.directive('match', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                match: '='
            },
            link: function(scope, elem, attrs, ctrl) {
                scope.$watch(function() {
                    return (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || scope.match === ctrl.$modelValue;
                }, function(currentValue) {
                    ctrl.$setValidity('match', currentValue);
                });
            }
        };
    });
