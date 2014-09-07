'use strict';

angular.module('login', [])
.controller('LoginCtrl', ['$scope', 'LoginService', '$modal', function($scope, loginService, $modal) {
    console.log('LoginCtrl');
    $scope.$on('authenticate', function(userDetails) {
		loginService.authenticate(userDetails)
			.success(function(data){
				$rootScope.userDetails = data;
				$rootScope.isUserLoggedin = true;
				$scope.loginLabel = "Sign Out";
				$scope.loginUser = {};
				$scope.showLoginmodal = false;
			}).error(function(e){
				
			});
	});
	
	$scope.$on('showLoginModal', function() {
		 var modalInstance = $modal.open({
			  templateUrl: 'modules/login/html/login.html',
			  controller: 'LoginModalCtrl'
			});
	});
	
	$scope.$on('showRegisterUserModal', function() {
		
	});

}])
.service('LoginService',['$http',  'servicesBaseUrl', function($http, servicesBaseUrl) {

	this.authenticate = function (loginUser) {
        return $http.get(servicesBaseUrl+'/users/'+loginUser.email);
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

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
	
	$scope.showRegisterModal = function() {
		$scope.cancel();
		var modalInstance = $modal.open({
			  templateUrl: 'modules/login/html/register-user.html',
			  controller: 'RegisterUserModalCtrl'
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
		
		loginService.authenticate(userDetails)
			.success(function(data){
				$scope.cancel();
				$rootScope.userDetails = data;
				$rootScope.isUserLoggedin = true;
				
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
				$scope.loginFailed = true;
			});
	};

}])
.controller('RegisterUserModalCtrl', ['$scope', '$modalInstance', 'LoginService', '$modal', function ($scope, $modalInstance, loginService, $modal) {

	$scope.form = {}

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
	
	$scope.showLoginModal = function() {
		 var modalInstance = $modal.open({
			  templateUrl: 'modules/login/html/login.html',
			  controller: 'LoginModalCtrl'
			});
	};
	
	$scope.validatePassword = function(form, password, confirmPassword) {
		
		/*form.confirmPassword.$error.invalidConfirmPassword = false;
		if(!password || !confirmPassword) {
			return;
		}
		
		form.confirmPassword.$valid = true;
		if(form.confirmPassword.$valid && password === confirmPassword) {
			form.confirmPassword.$error.invalidConfirmPassword = true;
			form.confirmPassword.$valid = false;
		}*/
	}
	
	$scope.register = function (newUser, invalid) {
	
		if(invalid) {
			return;
		}
	
		loginService.register(newUser)
			.success(function(data){
				$scope.cancel();
				var modalInstance = $modal.open({
				  templateUrl: 'modules/login/html/register-success.html',
				  controller: 'ModalInstanceCtrl'
				});
				
				modalInstance.result.then(function (result) {
					 $scope.showLoginModal();
				});
			}).error(function(e){
				
			});
	
	};
	

	
}]);

