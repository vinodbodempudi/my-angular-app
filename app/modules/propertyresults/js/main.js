'use strict';

angular.module('propertyResults', [])

.controller('PropertyResultsCtrl',['$scope', '$routeParams', 'PropertyResultsService', 'FatHomeUtil', function($scope, $routeParams, propertyResultsService, fatHomeUtil) {
    $scope.city = $routeParams.city;
	$scope.locality = $routeParams.locality;
	$scope.properties = [];
	$scope.sortOptions = fatHomeUtil.propertySortOptions();
	$scope.bedRoomsDropDownValues = fatHomeUtil.bedRoomsDropDownValues();
	$scope.propertyTypes = fatHomeUtil.propertyTypes();
	$scope.propertySubTypeMapper = fatHomeUtil.propertySubTypeMapper();
	
	/*var initializeMap = function () {
	  var mapOptions = {
							zoom: 8,
							center: new google.maps.LatLng(17.4833, 78.4167),
							mapTypeId: google.maps.MapTypeId.ROADMAP
						};
	  map = new google.maps.Map(document.getElementById('map'), mapOptions);
	}
	
	initializeMap();*/
	
    var getPropertiesRequest = {city:$routeParams.city, locality:$routeParams.locality};

	propertyResultsService.getProperties(getPropertiesRequest)
		.success(function(data){
			$scope.properties = data;
		}).error(function(e){
			
		});
	
	
	$scope.getPropertyDetails = function(propertyId) {
	
		propertyResultsService.getPropertyDetails(propertyId)
		.success(function(data){
			$scope.showPage = 'propertyDetails';
			$scope.property = data;
		}).error(function(e){
			
		});
	
	};
	$scope.showPropertyResults = function() {
		$scope.showPage = 'propertyResults';
	}
}]).service('PropertyResultsService',['$http',  function($http) {
	var getPropertiesURL = 'http://localhost:3000/properties';
	var getPropertyDetailsURL = 'http://localhost:3000/properties';
	
	//var getPropertiesURL = 'data/propertyresults.json';
	//var getPropertyDetailsURL = 'data/propertyresults.json';
	
    this.getProperties = function (getPropertiesRequest) {
        return $http.get(getPropertiesURL+'/'+getPropertiesRequest.city+'/'+getPropertiesRequest.locality);
		//return $http.get(getPropertiesURL);
    };
	
	this.getPropertyDetails = function (propertyId) {
        return $http.get(getPropertyDetailsURL+'/'+propertyId);
		//return $http.get(getPropertyDetailsURL);
    };

}]).filter('filterPropertiesResults', [function () {
    return function (properties, filterOption) {
        if (!angular.isUndefined(properties) && !angular.isUndefined(filterOption)) {
            var tempProperties = [], property;
			for (var i = 0; i < properties.length; i++) { 
				property = properties[i];
				if(filterOption.propertType && filterOption.propertType !== property.propertySubType) {
					continue;
				}
				
				if(filterOption.beds && Number(filterOption.beds) !== Number(property.bedRooms)) {
					continue;
				}
				
				if(filterOption.minPrice && Number(filterOption.minPrice) > Number(property.price)) {
					continue;
				}
				
				if(filterOption.maxPrice && Number(filterOption.maxPrice) < Number(property.price)) {
					continue;
				}
				
				if(filterOption.purpose && "Rent" !== property.purpose) {
					continue;
				}
								
				if(filterOption.minSft && Number(filterOption.minSft) > Number(property.size)) {
					continue;
				}
				
				if(filterOption.maxSft && Number(filterOption.maxSft) < Number(property.size)) {
					continue;
				}
			
				tempProperties.push(property);
            };
            return tempProperties;
        } else {
            return properties;
        }
    };
}]).filter('sortPropertyResults', function() {
  return function(properties, field, reverse) {
    var filtered = [];
    angular.forEach(properties, function(property) {
      filtered.push(property);
    });
    filtered.sort(function (a, b) {
		var tempa = a[field], tempb = b[field];
		return (tempa > tempb ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
}).directive('propertyResults', function() {
	return {
		replace:true,
		restrict: 'EA',
		/*scope : {
			properties:"=",
			filter:"="
		},*/
		templateUrl: 'modules/propertyresults/html/property-results-partial.html',
		link:function(scope) {
		
			var initializeMap = function () {
			var mapOptions = {
									zoom: 8,
									center: new google.maps.LatLng(17.4833, 78.4167),
									mapTypeId: google.maps.MapTypeId.ROADMAP
								};
			  map = new google.maps.Map(document.getElementById('map'), mapOptions);
			}
			
			initializeMap();
		
		
		}
	};
}).directive('propertyDetails', function() {
	return {
		replace:true,
		restrict: 'EA',
		/*scope : {
			property:"="
		},*/
		templateUrl: 'modules/propertydetails/html/property-details.html',
		link:function(scope) {
		
			var initializeMap = function () {
			var mapOptions = {
									zoom: 8,
									center: new google.maps.LatLng(17.4833, 78.4167),
									mapTypeId: google.maps.MapTypeId.ROADMAP
								};
			  map = new google.maps.Map(document.getElementById('map'), mapOptions);
			}
			
			initializeMap();
		
		
		}
	};
});


