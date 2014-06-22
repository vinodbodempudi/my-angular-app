'use strict';

angular.module('propertyDetails', [])

.controller('PropertyDetailsCtrl',['$scope', '$routeParams', 'PropertyDetailsService', function($scope, $routeParams, propertyDetailsService) {
    
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

