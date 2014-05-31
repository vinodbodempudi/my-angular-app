'use strict';

angular.module('registerProperty', [])

.controller('RegisterPropertyCtrl',['$scope', 'RegisterPropertyService', function($scope, registerPropertyService) {
    
    $scope.property = {};
	
	registerPropertyService.getCities()
		.success(function(data){
		        $scope.cities = data;
		    }).error(function(e){
		    	
		    });
	
	registerPropertyService.getLocalities()
		.success(function(data){
		        $scope.localities = data;
		    }).error(function(e){
		    	
		    });

    $scope.registerProperty = function () {
	
		alert(angular.toJson($scope.property))
	
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
	
	this.getCities = function () {
        return $http.get('data/cities.json');
    };
	
	this.getLocalities = function () {
        return $http.get('data/localities.json');
    };

}]);
