'use strict';

angular.module('propertyDetails', [])

.controller('PropertyDetailsCtrl',['$scope', 'LocationService', '$routeParams', 'PropertyDetailsService', function($scope, locationService, $routeParams, propertyDetailsService) {
    
	$scope.user.city = $scope.city = $routeParams.city;
	$scope.user.locality = $scope.locality = $routeParams.locality;
	
	if(!$scope.fatHome.cities) {
		locationService.getCities()
			.success(function(data){
				$scope.fatHome.cities = data;
				$scope.getLocalities($scope.city);
			}).error(function(e){
				
			});
	}
	
	$scope.getLocalities = function(city) {

		locationService.getLocalities(city)
			.success(function(data){
				$scope.fatHome.localities = data;
			}).error(function(e){
				
			});
	}
	
	var initializeMap = function () {
	  var mapOptions = {
							zoom: 8,
							center: new google.maps.LatLng(17.4833, 78.4167),
							mapTypeId: google.maps.MapTypeId.ROADMAP
						};
	  map = new google.maps.Map(document.getElementById('map'), mapOptions);
	}
	
	initializeMap();
	
    propertyDetailsService.getPropertyDetails({'id':$routeParams.propertyId})
		.success(function(data){
			$scope.property = data;
		}).error(function(e){
			
		});


}]).service('PropertyDetailsService',['$http',  'servicesBaseUrl', function($http, servicesBaseUrl) {

    this.getPropertyDetails = function (request) {
        return $http.get(servicesBaseUrl+'/properties/'+request.id);
    };

}]);

