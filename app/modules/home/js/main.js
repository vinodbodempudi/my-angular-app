'use strict';

angular.module('home', [])

.controller('HomeCtrl',['$scope', 'LocationService', function($scope, locationService) {
    
	locationService.getCities()
		.success(function(data){
		        $scope.cities = data;
				$scope.cities.unshift("Select City");
				$scope.city = $scope.cities[0];
		    }).error(function(e){
		    	
		    });
	
	
	$scope.getLocalities = function(city) {
		locationService.getLocalities()
		.success(function(data){
		        $scope.localities = data;
				$scope.localities.unshift("Select Locality");
				$scope.locality = $scope.localities[0];
		    }).error(function(e){
		    	
		    });
	}
	
	
    


}]).service('HomeService',['$http',  function($http) {

	
}]);

