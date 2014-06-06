'use strict';

angular.module('registerProperty', [])

.controller('RegisterPropertyCtrl',['$scope', 'LocationService', 'RegisterPropertyService', function($scope, locationService, registerPropertyService) {
    
    $scope.property = {};
	/*$scope.property.user = {};
	$scope.property.user.emails = [''];
	$scope.addEmail = function(){
    	$scope.property.user.emails.push('');
    }
	
	$scope.removeEmail = function(i){
    	if(i>0) $scope.property.user.emails.splice(i,1);
    }
	*/
	locationService.getCities()
	.success(function(data){
			$scope.cities = data;
		}).error(function(e){
			
		});
	
	
	$scope.getLocalities = function(city) {
		locationService.getLocalities()
		.success(function(data){
		        $scope.localities = data;
		    }).error(function(e){
		    	
		    });
	}
	
	

    $scope.registerProperty = function () {
	
		alert(angular.toJson($scope.property))
		console.log(angular.toJson($scope.property));
       registerPropertyService.registerProperty(angular.toJson($scope.property))
       	    .success(function(data){
		        
		    }).error(function(e){
		    	
		    });
    };


}])
.service('RegisterPropertyService',['$http',  function($http) {
    this.registerProperty = function (property) {
        return $http.post('', property);
    };
}]);
