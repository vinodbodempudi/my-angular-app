'use strict';

angular.module('login', [])
.controller('LoginCtrl', ['$scope', 'LoginService', '$modal', '$location', function($scope, loginService, $modal, $location) {

	$scope.$on('showLoginModal', function() {
	
		if($location.path().match('registerproperty') != null) {
			$modal.open({
			  templateUrl: 'modules/login/html/login.html',
			  controller: 'LoginModalCtrl',
			  keyboard:false,
			  backdrop:'static',
			  windowClass:'sign-modal'
			});
			return;
		}
	
		 $modal.open({
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
				
				localStorage.setItem("userDetails", angular.toJson(data));
				localStorage.setItem("rememberMe", userDetails.rememberMe);
				
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
	$scope.newUser = {city:$scope.user.city, locality:$scope.user.locality};
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
		$scope.duplicateEmail = false;
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
			}).error(function(response, status){
				$scope.registerInProgress = false;
								
				if(status === 409) {
					$scope.duplicateEmail = true;
				}
				
			});
	
	};
	

	
}]);

