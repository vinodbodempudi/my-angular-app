'use strict';

angular.module('fatHomesApp')
  .controller('LoginCtrl', function ($scope, $log, UserService) {

  $scope.create = function(user) {
     
     $log.info('Inside create method!');
     var newUser = new UserService(user);

         newUser.$save(); 
  
    };

  $scope.login = function(email) {
     
     $log.info('Inside login method!');
     UserService.get({id:email}, function(user){
     	$log.info(user);
   		 if($scope.password == user.password)
   		 {
   		 	$scope.loginPassed = true;
   		 	$scope.Signin = 'SignOut';
   		 }
   		 else
   		 {
           $scope.loginPassed = false;
           $scope.Signin = 'SignIn';
   		 }

     });
  
    };  


  });