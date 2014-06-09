'use strict';

var app = angular.module('fatHomesApp', [
  'ngCookies',
  'ngSanitize',
  'ngRoute',
  'ngResource',
  'registerProperty',
  'home',
  'propertyResults',
  'propertyDetails',
  'login'
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


      .when('/login', {
        templateUrl: 'modules/login/html/login.html',
        controller: 'LoginCtrl'
      })
      .when('/propertyresults/:city/:locality', {
        templateUrl: 'modules/propertyresults/html/property-results.html',
        controller: 'PropertyResultsCtrl'
      })
      .when('/propertyDetails/:propertyId', {
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

app.service('LocationService',['$http',  function($http) {

	var citiesURL ='data/cities.json';
	var localitiesURL ='data/localities.json';
	
	//var citiesURL ='http://localhost:3000/cities';
	//var localitiesURL ='http://localhost:3000/localities/';
	
	this.getCities = function () {
        return $http.get(citiesURL);
    };
	
	this.getLocalities = function () {
        return $http.get(localitiesURL);
    };

}]);

app.controller('fatHomeController', ['$scope', 'LoginService', function($scope, loginService) {

	$scope.login = function (loginUser) {
		loginService.authenticate(loginUser)
			.success(function(data){
				$scope.loginLabel = "Sign Out";
				$('#signin').hide();
				$('.modal-backdrop').remove();
			}).error(function(e){
				
			});
	
	};
}]);

app.service('LoginService',['$http',  function($http) {

	this.authenticate = function (loginUser) {
        return $http.get('data/cities.json', loginUser);
    };
}])

/*app.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
	$scope.data = data;

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);*/
	
	
