'use strict';

var app = angular.module('fatHomesApp', [
  'ngCookies',
  'ngSanitize',
  'ngRoute',
  'ngResource',
  'registerProperty',
  'home',
  'propertyResults',
  'propertyDetails'
]);
  
app.config(function ($routeProvider) {
    $routeProvider
      /*.when('/', {
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
      .when('/detail', {
        templateUrl: 'views/detail.html',
        controller: 'LoginCtrl'
      })*/


      .when('/newLogin', {
        templateUrl: 'modules/login/html/login.html',
        controller: 'LoginCtrl'
      })
      .when('/propertyresults', {
        templateUrl: 'modules/propertyresults/html/property-results.html',
        controller: 'PropertyResultsCtrl'
      })
      .when('/propertyDetails', {
        templateUrl: 'modules/propertydetails/html/property-details.html',
        controller: 'PropertyDetailsCtrl'
      })
      .when('/registerProperty', {
        templateUrl: 'modules/registerProperty/html/register-property.html',
        controller: 'RegisterPropertyCtrl'
      })
      .when('/home', {
        templateUrl: 'modules/home/html/home.html',
        controller: 'HomeCtrl'
      })


      .otherwise({
        redirectTo: '/home'
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
