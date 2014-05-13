'use strict';

angular.module('fatHomesApp')
  .controller('LoginCtrl', function ($scope, $log, UserService) {

  $scope.create = function(newUser) {
     
     $log.info('Inside create method!');
     var newNewUser = new UserService(newUser);

         newNewUser.$save(); 
         $log.info(newNewUser);
    };

  $scope.login = function(loginUser) {
     
     $log.info('Inside login method!');
     UserService.get({id:loginUser.email}, function(user){
     	$log.info(user);
   		 if(loginUser.password == user.password)
   		 {
   		 	loginUser.loginPassed = true;
        loginUser.loginFailed = false;
   		 	$scope.signinText = 'Sign Out';
   		 }
   		 else
   		 {
           loginUser.loginPassed = false;
           loginUser.loginFailed = true;
           $scope.signinText = 'Sign In';
   		 }

     });
  
    };  


  });