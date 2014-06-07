'use strict';

angular.module('propertyResults', [])

.controller('PropertyResultsCtrl',['$scope', '$routeParams', 'PropertyResultsService', function($scope, $routeParams, propertyResultsService) {
    $scope.city = $routeParams.city;
	$scope.locality = $routeParams.locality;
	
	
	var initializeMap = function () {
	  var mapOptions = {
							zoom: 8,
							center: new google.maps.LatLng(17.4833, 78.4167),
							mapTypeId: google.maps.MapTypeId.ROADMAP
						};
	  map = new google.maps.Map(document.getElementById('map'), mapOptions);
	}
	
	initializeMap();
	
    var getPropertiesRequest = {city:$routeParams.city, locality:$routeParams.locality};

	propertyResultsService.getProperties(getPropertiesRequest)
		.success(function(data){
			$scope.propertyResults = data;
		}).error(function(e){
			
		});
	

}]).service('PropertyResultsService',['$http',  function($http) {

    this.getProperties = function (getPropertiesRequest) {
        return $http.get('data/propertyresults.json', getPropertiesRequest);
    };

}]);


