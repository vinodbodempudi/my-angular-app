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
	
	this.verifyOTP = function (request) {
        return $http.post(servicesBaseUrl+'/users/account-verification', angular.toJson(request));
		//return $http.get('data/login.json');
    };
	
	this.resendOTP = function (userId) {
        return $http.get(servicesBaseUrl+'/users/'+userId+'/resend-otp');
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

	$scope.cancel = function (isFromRegisterUserAction) {
		$modalInstance.dismiss('cancel');
		if(!isFromRegisterUserAction) {
			$rootScope.showPostProperty = false;
		}
		
		if(!$rootScope.isUserLoggedin && $location.path().match('registerproperty') != null) {
			$location.path('/properties/' + $scope.user.city + '/' + $scope.user.locality);
		}
	};
	
	$scope.showRegisterModal = function() {
		$scope.cancel(true);
		var modalInstance = $modal.open({
			  templateUrl: 'modules/login/html/register-user.html',
			  controller: 'RegisterUserModalCtrl',
			  windowClass:'sign-modal'
			});
	
	}

	if(localStorage.rememberMe) {
		$scope.loginUser = {};
		$scope.loginUser.email = localStorage.userName;
		$scope.loginUser.password = localStorage.password;
		$scope.loginUser.rememberMe = true;
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
				$scope.cancel();
				if(!data.hasOwnProperty('verified') || data.verified) {
					loginSuccess(data);
					return;
				}
				showOTPModal(data);
			}).error(function(e){
				$scope.loginInProgress = false;
				$scope.loginFailed = true;
			});
	};
	
	function showOTPModal(data) {
	 var modalInstance = $modal.open({
		  templateUrl: 'modules/login/html/account-verification.html',
		  controller: 'AccountVerificationModalCtrl',
		  windowClass:'sign-modal',
		  resolve: {
			userDetails: function () { return data; }
		  }
		});
	}
	
	function loginSuccess(userDetails) {
		$rootScope.userDetails = userDetails;
		$rootScope.isUserLoggedin = true;
		
		localStorage.setItem("userDetails", angular.toJson(userDetails));
		
		if(userDetails.rememberMe) {
			localStorage.userName = userDetails.email;
			localStorage.password =  userDetails.password;
			localStorage.rememberMe = userDetails.rememberMe;
		} else {
			localStorage.removeItem("userName");
			localStorage.removeItem("password");
			localStorage.removeItem("rememberMe");
		}
		
		if($rootScope.showPostProperty) {
			$rootScope.showPostProperty = false;
			$location.path('/registerproperty/' + $scope.user.city + '/' + $scope.user.locality);
		}
		
		if($rootScope.showMyListPopover) {
			$rootScope.showMyListPopover = false;
			$rootScope.$broadcast('showMyListPopOver');
		}
	}

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
					 $scope.showOTPModal(data);
				});
			}).error(function(response, status){
				$scope.registerInProgress = false;
								
				if(status === 409) {
					$scope.duplicateEmail = true;
				}
				
			});
	
	};
	
	$scope.showOTPModal = function(data) {
		 var modalInstance = $modal.open({
			  templateUrl: 'modules/login/html/account-verification.html',
			  controller: 'AccountVerificationModalCtrl',
			  windowClass:'sign-modal',
			  resolve: {
				userDetails: function () { return data; }
			  }
			});
	}

	
}])
.controller('AccountVerificationModalCtrl', ['$scope', '$modalInstance', 'LoginService', '$rootScope', '$location', 'userDetails', 
	function ($scope, $modalInstance, loginService, $rootScope, $location, userDetails) {

	$scope.accountVerificationInProgress = false;
	$scope.otpResendInProgress = false;
	$scope.otpSent = false;
	$scope.userDetails = userDetails;
	
	
	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
		
	};

	$scope.resendOTP = function () {
		$scope.otpResendInProgress = true;
		loginService.resendOTP(userDetails._id)
			.success(function(data){
				$scope.otpResendInProgress = false;
				$scope.otpSent = true;
			}).error(function(response, status){
				
			});
	}
		
	$scope.verifyOTP = function (oneTimePassword) {
		
	
		$scope.accountVerificationInProgress = true;
		
		var request = {userId:userDetails._id, verificationCode:oneTimePassword};
		
		loginService.verifyOTP(request)
			.success(function(data){
				$scope.accountVerificationInProgress = false;
				$scope.cancel();
				accountVerificationSuccess(data);
			}).error(function(response, status){
				$scope.accountVerificationInProgress = false;
								
				if(status === 401) {
					$scope.otpFailed = true;
				}
				
			});
	
	};
	
	function accountVerificationSuccess(userDetails) {
		$rootScope.userDetails = userDetails;
		$rootScope.isUserLoggedin = true;
		
		localStorage.setItem("userDetails", angular.toJson(userDetails));
		
		if(userDetails.rememberMe) {
			localStorage.userName = userDetails.email;
			localStorage.password =  userDetails.password;
			localStorage.rememberMe = userDetails.rememberMe;
		} else {
			localStorage.removeItem("userName");
			localStorage.removeItem("password");
			localStorage.removeItem("rememberMe");
		}
		
		if($rootScope.showPostProperty) {
			$rootScope.showPostProperty = false;
			$location.path('/registerproperty/' + $scope.user.city + '/' + $scope.user.locality);
		}
		
		if($rootScope.showMyListPopover) {
			$rootScope.showMyListPopover = false;
			$rootScope.$broadcast('showMyListPopOver');
		}
	}

	
}]);

