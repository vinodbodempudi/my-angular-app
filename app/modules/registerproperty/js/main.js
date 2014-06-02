'use strict';

angular.module('registerProperty', [])

.controller('RegisterPropertyCtrl',['$scope', 'RegisterPropertyService', function($scope, registerPropertyService) {
    
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
	registerPropertyService.getCities()
		.success(function(data){
		        $scope.cities = data;
		    }).error(function(e){
		    	
		    });
	
	
	$scope.getLocalities = function(city) {
		registerPropertyService.getLocalities()
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

	var citiesURL ='data/cities.json';
	var localitiesURL ='data/localities.json';
	
	//var citiesURL ='http://localhost:3000/cities';
	//var localitiesURL ='http://localhost:3000/localities/';

    this.registerProperty = function (property) {
        return $http.post('', property);
    };
	
	this.getCities = function () {
        return $http.get(citiesURL);
    };
	
	this.getLocalities = function () {
        return $http.get(localitiesURL);
    };

}]);
