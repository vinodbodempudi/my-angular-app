'use strict';

angular.module('login', [])
.controller('LoginCtrl', ['$scope', 'LoginService', '$modal', function($scope, loginService, $modal) {

	$scope.$on('showLoginModal', function() {
		 var modalInstance = $modal.open({
			  templateUrl: 'modules/login/html/login.html',
			  controller: 'LoginModalCtrl',
			  windowClass:'sign-modal'
			});
	});
	
	$scope.$on('showRegisterUserModal', function() {
		
	});

}])
.service('LoginService',['$http',  'servicesBaseUrl', function($http, servicesBaseUrl) {

	this.authenticate = function (loginUser) {
        return $http.post(servicesBaseUrl+'/users/authenticate', angular.toJson(loginUser));
		//return $http.get('data/login.json');
    };
	
	this.register = function (newUser) {
        return $http.post(servicesBaseUrl+'/users', angular.toJson(newUser));
		//console.log(angular.toJson(newUser));
		//return $http.get('data/register.json');
    };

}])
.controller('LoginModalCtrl', ['$scope', '$modalInstance', '$modal', 'LoginService', '$rootScope', '$location',
	function ($scope, $modalInstance, $modal, loginService, $rootScope, $location) {

	$scope.loginInProgress = false;
	$scope.ok = function () {
		$modalInstance.close();
		if(!$rootScope.isUserLoggedin && $location.path().match('registerproperty') != null) {
			$location.path('/properties/' + $scope.user.city + '/' + $scope.user.locality);
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
		if(!$rootScope.isUserLoggedin && $location.path().match('registerproperty') != null) {
			$location.path('/properties/' + $scope.user.city + '/' + $scope.user.locality);
		}
	};
	
	$scope.showRegisterModal = function() {
		$scope.cancel();
		var modalInstance = $modal.open({
			  templateUrl: 'modules/login/html/register-user.html',
			  controller: 'RegisterUserModalCtrl',
			  windowClass:'sign-modal'
			});
	
	}
	
	var userDetails = localStorage.getItem("userDetails");
	if(userDetails) {
		$scope.loginUser = angular.fromJson(userDetails);
	}

	$scope.authenticate = function(userDetails, invalid) {
		$scope.loginFailed = false;
		if(invalid) {
			return;
		}
		
		$scope.loginInProgress = true;
		loginService.authenticate(userDetails)
			.success(function(data){
				$scope.loginInProgress = false;
				$rootScope.userDetails = data;
				$rootScope.isUserLoggedin = true;
				$scope.cancel();
				if(userDetails.rememberMe) {
					localStorage.setItem("userDetails", angular.toJson(userDetails));
				} else {
					localStorage.removeItem("userDetails");
				}
				
				if($rootScope.showPostProperty) {
					$rootScope.showPostProperty = false;
					$location.path('/registerproperty/' + $scope.user.city + '/' + $scope.user.locality);
				}
				
				
			}).error(function(e){
				$scope.loginInProgress = false;
				$scope.loginFailed = true;
			});
	};

}])
.controller('RegisterUserModalCtrl', ['$scope', '$modalInstance', 'LoginService', '$modal', '$rootScope', '$location',
	function ($scope, $modalInstance, loginService, $modal, $rootScope, $location) {

	$scope.registerInProgress = false;

	$scope.ok = function () {
		$modalInstance.close();
		if(!$rootScope.isUserLoggedin && $location.path().match('registerproperty') != null) {
			$location.path('/properties/' + $scope.user.city + '/' + $scope.user.locality);
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
		if(!$rootScope.isUserLoggedin && $location.path().match('registerproperty') != null) {
			$location.path('/properties/' + $scope.user.city + '/' + $scope.user.locality);
		}
	};
	
	$scope.showLoginModal = function() {
		 var modalInstance = $modal.open({
			  templateUrl: 'modules/login/html/login.html',
			  controller: 'LoginModalCtrl',
			  windowClass:'sign-modal'
			});
	};
	
	$scope.validatePassword = function(password, confirmPassword) {
		
		$scope.invalidConfirmPassword = false;
		if(!password || !confirmPassword) {
			return;
		}

		if(confirmPassword && password != confirmPassword) {
			$scope.invalidConfirmPassword = true;
		}
	}
	
	$scope.register = function (newUser, invalid) {
	
		if(invalid || $scope.invalidConfirmPassword) {
			return;
		}
	
		$scope.registerInProgress = true;
		loginService.register(newUser)
			.success(function(data){
				$scope.registerInProgress = false;
				$scope.cancel();
				var modalInstance = $modal.open({
				  templateUrl: 'modules/login/html/register-success.html',
				  controller: 'ModalInstanceCtrl',
				  windowClass:'sign-modal'
				});
				
				modalInstance.result.then(function (result) {
					 $scope.showLoginModal();
				});
			}).error(function(e){
				$scope.registerInProgress = false;
			});
	
	};
	

	
}]);

