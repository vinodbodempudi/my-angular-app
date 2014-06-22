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
//app.constant('servicesBaseUrl', 'http://54.88.7.125:3000');
app.constant('servicesBaseUrl', 'http://localhost:3000');
app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/propertyresults/:city/:locality', {
        templateUrl: 'modules/propertyresults/html/property-results.html',
        controller: 'PropertyResultsCtrl'
      })
      .when('/propertydetails/:propertyId', {
        templateUrl: 'modules/propertydetails/html/property-details.html',
        controller: 'PropertyDetailsCtrl'
      })
      .when('/registerproperty', {
        templateUrl: 'modules/registerproperty/html/register-property.html',
        controller: 'RegisterPropertyCtrl'
      })
      .when('/home', {
        templateUrl: 'modules/home/html/home.html',
        controller: 'HomeCtrl'
      })
      .otherwise({
        redirectTo: '/home'
      });
	  
	 $httpProvider.defaults.cache = false; // disable http caching    
    /*if (!$httpProvider.defaults.headers.get) {//initialize get if not there
        $httpProvider.defaults.headers.get = {};    
    }    
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';//disable IE ajax request caching*/
  });
app.run(['$rootScope', '$location',function($rootScope, $location){
	$rootScope.showTabs = {};
	if($location.path().match('propertydetails') != null
		||  $location.path().match('propertyresults') != null
		||  $location.path().match('registerproperty') != null) {
			$rootScope.showTabs = {};
			$rootScope.showTabs.showTabs = true;
		}
}]);
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

app.service('LocationService', ['$http', 'servicesBaseUrl', function($http, servicesBaseUrl) {

	this.getCities = function () {
        return $http.get(servicesBaseUrl+'/cities');
		//return $http.get('data/cities.json');
    };
	
	this.getLocalities = function (city) {
        return $http.get(servicesBaseUrl+'/localities/'+city);
		//return $http.get('data/localities.json');
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
		locationService.getLocalities(city)
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
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
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
	
	
