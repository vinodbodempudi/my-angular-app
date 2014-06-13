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
  'login',
  'imageupload'
]);
  
app.config(function ($routeProvider) {
    $routeProvider
      
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

app.controller('fatHomeController', ['$scope', '$rootScope', '$location', 'LoginService', 'LocationService', function($scope, $rootScope, $location, loginService, locationService) {
	
	$scope.showLoginModal = function (loginUser) {
		if($rootScope.isUserLoggedin) {
			$rootScope.userDetails = null;
			$rootScope.isUserLoggedin = false;
			$scope.loginLabel = "Sign In";
			//$location.path('/home');
			return;
		}
	
		$scope.showLoginmodal = true;
		$scope.showRegistermodal = false;
	}
	
	$scope.showRegisterModal = function () {
		$scope.showLoginmodal = false;
		$scope.showRegistermodal = true;
		
		if(!$scope.cities) {
			$scope.getCities();
		}
	}
	
	$scope.getCities = function() {
		locationService.getCities()
		.success(function(data){
				$scope.cities = data;
			}).error(function(e){
				
			});
	}
	
	
	$scope.getLocalities = function(city) {
		locationService.getLocalities()
		.success(function(data){
		        $scope.localities = data;
		    }).error(function(e){
		    	
		    });
	};
	
	$scope.login = function (loginUser) {
		loginService.authenticate(loginUser)
			.success(function(data){
				$rootScope.userDetails = data;
				$rootScope.isUserLoggedin = true;
				$scope.loginLabel = "Sign Out";
				$scope.loginUser = {};
				$scope.showLoginmodal = false;
			}).error(function(e){
				
			});
	
	};
	
	$scope.register = function (newUser) {
		loginService.register(newUser)
			.success(function(data){
				$rootScope.userDetails = data;
				$rootScope.isUserLoggedin = true;
				$scope.loginLabel = "Sign Out";
				$scope.loginUser = {};
				$scope.showRegistermodal = false;
			}).error(function(e){
				
			});
	
	};
}]);

app.service('LoginService',['$http',  function($http) {

	this.authenticate = function (loginUser) {
        return $http.get('data/cities.json', loginUser);
    };
	
	this.register = function (newUser) {
        return $http.get('data/cities.json', newUser);
    };
}])


app.directive("modalShow", function () {
    return {
        restrict: "A",
        scope: {
            modalVisible: "="
        },
        link: function (scope, element, attrs) {

            //Hide or show the modal
            scope.showModal = function (visible) {
                if (visible)
                {
                    element.modal("show");
                }
                else
                {
                    element.modal("hide");
                }
            }

            //Check to see if the modal-visible attribute exists
            if (!attrs.modalVisible)
            {

                //The attribute isn't defined, show the modal by default
                scope.showModal(true);

            }
            else
            {

                //Watch for changes to the modal-visible attribute
                scope.$watch("modalVisible", function (newValue, oldValue) {
                    scope.showModal(newValue);
                });

                //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                element.bind("hide.bs.modal", function () {
                    scope.modalVisible = false;
                    if (!scope.$$phase && !scope.$root.$$phase)
                        scope.$apply();
                });

            }

        }
    };

});

/*app.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
	$scope.data = data;

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);*/
	
	
