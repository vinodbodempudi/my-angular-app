'use strict';

var app = angular.module('fatHomesApp', [
  'ngCookies',
  'ngSanitize',
  'ngRoute',
  'ngResource',
  'registerProperty',
  'home',
  'login',
  'imageupload',
  'nya.bootstrap.select',
  'ui.bootstrap',
  'properties'
]);
//app.constant('servicesBaseUrl', 'http://54.88.7.125:3000');
app.constant('servicesBaseUrl', 'http://localhost:3000');
app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/propertyresults/:city/:locality', {
        templateUrl: 'modules/propertyresults/html/property-results.html',
        controller: 'PropertyResultsCtrl'
      })
	  .when('/properties/:city/:locality', {
        templateUrl: 'modules/properties/html/properties.html',
        controller: 'PropertiesCtrl',
		reloadOnSearch:false
      })
      .when('/properties/:city/:locality/:propertyId', {
        templateUrl: 'modules/properties/html/properties.html',
        controller: 'PropertiesCtrl',
		reloadOnSearch:false
      })
      .when('/registerproperty/:city/:locality', {
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
app.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
	var original = $location.path;
	$location.path = function (path, reload) {
		if (reload === false) {
			var lastRoute = $route.current;
			var un = $rootScope.$on('$locationChangeSuccess', function () {
				$route.current = lastRoute;
				un();
			});
		}
		return original.apply($location, [path]);
	};
}]);
app.run(['$rootScope', '$location',function($rootScope, $location){
	$rootScope.showTabs = {};
	if($location.path().match('properties') != null || $location.path().match('registerproperty') != null) {
		$rootScope.showTabs = {};
		$rootScope.showTabs.showTabs = true;
		return;
	}
	
	if(!$location.path() || $location.path().match('home') != null) {
		var cityFromCache = localStorage.getItem("city");
		var localityFromCache = localStorage.getItem("locality");
		if(cityFromCache && localityFromCache) {
			$location.path('/properties/' + cityFromCache + '/' + localityFromCache);
			$rootScope.showTabs = {};
			$rootScope.showTabs.showTabs = true;
		}
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
app.directive('selectpicker', ['$timeout',
    function($timeout){
        return {
            restrict: 'A',
            link: function(scope, element, iAttrs, controller){
                var initSelectpicker = function(){
                    element.selectpicker();
                }
                $timeout(initSelectpicker, 0, false);
				
				/*scope.$watch(function() {
					console.log(scope);
					element.selectpicker('refresh');
				});*/
            }
        };
    }]);
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

app.controller('fatHomeController', ['$scope', '$rootScope', '$location', 'LoginService', 'LocationService', 'fatHomeUtilService', 
	function($scope, $rootScope, $location, loginService, locationService, fatHomeUtilService) {
	
	$rootScope.fatHome={};
	$rootScope.user={};

	if(typeof(Storage) !== "undefined") {
		$rootScope.$watch("user", function(newValue, oldValue){
			if(newValue.city) {
				localStorage.setItem("city", newValue.city);
			}
			
			if(newValue.locality) {
				localStorage.setItem("locality", newValue.locality);
			}
		}, true)	
	}
	
	
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
	
	
	$scope.sendFeedback = function (feedback) {
	
		$scope.feedbackform.submitted=true;
		
		if($scope.feedbackform.$valid) {
		
			feedback.city = $scope.user.city;
			feedback.locality = $scope.user.locality;
			feedback.user = $scope.userDetails;
			fatHomeUtilService.sendFeedback(feedback)
			.success(function(data){
				$scope.showFeedbackmodal = false;
				$scope.feedback = {};
				$scope.feedbackform.submitted = false;
			}).error(function(e){
				
			});
	
		}
	};
}]);

app.service('LoginService',['$http',  function($http) {

	this.authenticate = function (loginUser) {
        return $http.get('data/cities.json', loginUser);
    };
	
	this.register = function (newUser) {
        return $http.get('data/cities.json', newUser);
    };

}]);
app.service('fatHomeUtilService',['$http', 'servicesBaseUrl', function($http, servicesBaseUrl) {

	this.sendFeedback = function (feedBack) {
        return $http.post(servicesBaseUrl+'/feedback', feedBack);
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

})
app.filter('ordinal', function() {
  return function(input) {
  
	if(!input) {
		return '';
	}
  
    return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z]/g, ' $&');
  }
})
app.directive('pleaseWait', ['$rootScope', 'SHOW_PROGRESS_BAR', 'HIDE_PROGRESS_BAR', function ($rootScope, SHOW_PROGRESS_BAR, HIDE_PROGRESS_BAR) {
	  var getDocHeight = function(){
	     var D = document, h = 0;
	     h = Math.max(D.documentElement.scrollHeight, Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), Math.max(D.body.clientHeight, D.documentElement.clientHeight));
	     return h;
	  };  
	  return {
	      restrict: 'EA',
	      replace:true,
	      templateUrl: 'shared/html/please-wait.html',
	      link: function (scope, element) {               
	          $rootScope.$on(SHOW_PROGRESS_BAR, function () {
	              element.show();
				   element.css('height', getDocHeight());
	          });
	          $rootScope.$on(HIDE_PROGRESS_BAR, function () {
	              element.hide();
	          });
	      }
	  };
  }]);
  
  app.constant('SHOW_PROGRESS_BAR', 'SHOW_PROGRESS_BAR');
  app.constant('HIDE_PROGRESS_BAR', 'HIDE_PROGRESS_BAR');

   app.config(['$httpProvider', 'SHOW_PROGRESS_BAR', 'HIDE_PROGRESS_BAR', function ($httpProvider, SHOW_PROGRESS_BAR, HIDE_PROGRESS_BAR) {
	$httpProvider.defaults.cache = false;
    var $modal, $http, interceptor = ['$q', '$injector', function ($q, $injector) {
            var rootScope;

            function success(response) {
                $http = $http || $injector.get('$http');
                if ($http.pendingRequests.length < 1) {
                    rootScope = rootScope || $injector.get('$rootScope');
                    rootScope.$broadcast(HIDE_PROGRESS_BAR);
                }
                return response;
            }

            function error(response) {
                $http = $http || $injector.get('$http');
                if ($http.pendingRequests.length < 1) {
                    rootScope = rootScope || $injector.get('$rootScope');
                    rootScope.$broadcast(HIDE_PROGRESS_BAR);
                }
                
                var data = {title:"Service Exception", data:response.data};
				
				alert("Service Exception : "+response.data);
				
                /*$modal = $modal || $injector.get('$modal');
            	$modal.open({
                    templateUrl: 'shared/html/TextAreaModal.html',
                    controller: 'ModalInstanceCtrl',
                    windowClass: 'tivoliModal_small',
                    resolve: {
            			data: function () {
    	                      return data;
    	                    }
                      }
                });*/
                
                return $q.reject(response);
            }

            return function (promise) {
                rootScope = rootScope || $injector.get('$rootScope');
                rootScope.$broadcast(SHOW_PROGRESS_BAR);
                return promise.then(success, error);
            }
        }];

    $httpProvider.responseInterceptors.push(interceptor);
   }]);
  
  
  
  
app.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
	$scope.data = data;

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);
	
	
