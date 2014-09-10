'use strict';

var app = angular.module('fatHomesApp', [
  'ngRoute',
  'registerProperty',
  'home',
  'imageupload',
  'nya.bootstrap.select',
  'ui.bootstrap',
  'properties',
  'login',
  'ngAnimate'
]);

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
	  .when('/browser', {
        templateUrl: 'shared/html/browser.html'
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
app.run(['$rootScope', '$location', '$window', function($rootScope, $location, $window){

	$rootScope.showTabs = {};
	
	$rootScope.$on('$locationChangeSuccess', function () {
		$rootScope.$broadcast('locationChangeSuccess', $location.path());
	});
	
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
	$http.defaults.useXDomain = true;
	this.getCities = function () {
        return $http.get(servicesBaseUrl+'/cities');
		//return $http.get('data/cities.json');
    };
	
	this.getLocalities = function (city) {
        return $http.get(servicesBaseUrl+'/localities/'+city);
		//return $http.get('data/localities.json');
    };

}]);

app.controller('fatHomeController', ['$scope', '$rootScope', '$location', 'LocationService', '$modal',
	function($scope, $rootScope, $location, locationService, $modal) {
	
	$rootScope.fatHome={};
	$rootScope.user={};
	$rootScope.isUserLoggedin=false;

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
	
	
	$scope.showLoginModal = function () {
		$scope.$broadcast('showLoginModal');
	}
	
	$scope.logOut = function (loginUser) {
		$rootScope.userDetails = null;
		$rootScope.isUserLoggedin = false;
		var modalInstance = $modal.open({
			  templateUrl: 'modules/login/html/signout-success.html',
			  controller: 'FeedBackModalCtrl'
			});
			
		modalInstance.result.then(function (result) {
			 if($location.path().match('registerproperty') != null) {
				$location.path('/properties/' + $scope.user.city + '/' + $scope.user.locality);
			}
		});
	}
	
	$scope.showFeedbackmodal = function () {
		var modalInstance = $modal.open({
			  templateUrl: 'shared/html/feedback.html',
			  controller: 'FeedBackModalCtrl'
			});
	}
	
	$scope.showContactmodal = function () {
		var modalInstance = $modal.open({
			  templateUrl: 'shared/html/contact.html',
			  controller :'ModalInstanceCtrl'
			});
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

	$scope.postProperty = function () {
		if($rootScope.isUserLoggedin) {
			$location.path('/registerproperty/' + $scope.user.city + '/' + $scope.user.locality);
			return;
		}
		$rootScope.showPostProperty = true;
		$scope.$broadcast('showLoginModal');
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
			  element.hide();
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
	$httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
		
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
				
				//alert("Service Exception : "+response.data);
				
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
                //rootScope.$broadcast(SHOW_PROGRESS_BAR);
                return promise.then(success, error);
            }
        }];

    $httpProvider.responseInterceptors.push(interceptor);
   }]);
  
  
  
app.controller('FeedBackModalCtrl', ['$scope', '$modalInstance', 'fatHomeUtilService', '$modal',
	function ($scope, $modalInstance, fatHomeUtilService, $modal) {

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
	
	$scope.sendFeedback = function (feedback, invalid) {
		if(invalid) {
			return;
		}
	
		feedback.city = $scope.user.city;
		feedback.locality = $scope.user.locality;
		feedback.user = $scope.userDetails;
		fatHomeUtilService.sendFeedback(feedback)
		.success(function(data){
			$scope.cancel();
			var modalInstance = $modal.open({
			  templateUrl: 'shared/html/feedback-success.html',
			  controller: 'ModalInstanceCtrl'
			});
		}).error(function(e){
			
		});

	};
	
}]);
  
  
  
app.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);
	
	
