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


}]).service('PropertyDetailsService',['$http',  function($http) {

	var getDetailsURL = 'http://localhost:3000/properties'

    this.getPropertyDetails = function (request) {
        return $http.get(getDetailsURL+'/'+request.id);
    };

}]);

