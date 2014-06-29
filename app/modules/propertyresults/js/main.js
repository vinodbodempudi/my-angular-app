'use strict';

angular.module('propertyResults', [])

.controller('PropertyResultsCtrl',['$scope', '$routeParams', 'PropertyResultsService', 'FatHomeUtil', 'LocationService', '$rootScope', '$location',
	function($scope, $routeParams, propertyResultsService, fatHomeUtil, locationService, $rootScope, $location) {
	
    $scope.city = $scope.newCity = $routeParams.city;
	$scope.locality = $scope.newLocality = $routeParams.locality;
	$scope.properties = [];
	$scope.sortOptions = fatHomeUtil.propertySortOptions();
	$scope.bedRoomsDropDownValues = fatHomeUtil.bedRoomsDropDownValues();
	$scope.propertyTypes = fatHomeUtil.propertyTypes();
	$scope.propertySubTypeMapper = fatHomeUtil.propertySubTypeMapper();
	$scope.predicate = {};
	
	$scope.openChangeLocationModal = function() {
	
		if(!$scope.cities) {
			locationService.getCities()
				.success(function(data){
					$scope.cities = data;
					$scope.getLocalities($scope.city);
				}).error(function(e){
					
				});
		}
		$scope.newCity = $scope.city;
		$scope.newLocality = $scope.locality;
		$scope.form1.submitted=false;
		$scope.showChangeLocationModal=true;
	}
	
	$scope.showProperties = function(city, locality) {
		$scope.form1.submitted=true;
		
		if($scope.form1.$valid) {
			$scope.showChangeLocationModal = false;
			$rootScope.userLocation = locality;
			$location.path('/propertyresults/' + locality.city + '/' + locality.locality);
		}
	}
	
	$scope.getLocalities = function(city) {
	
		if(!city) {
			$scope.localities = [];
			return;
		}
	
		locationService.getLocalities(city)
		.success(function(data){
		        $scope.localities = data;
		}).error(function(e){
			
		});
	}
		
    var getPropertiesRequest = {city:$routeParams.city, locality:$routeParams.locality};

	propertyResultsService.getProperties(getPropertiesRequest)
		.success(function(data){
			$scope.properties = data;
			$scope.predicate.dataField = 'createdDate';
			$scope.predicate.reverseOrder = true;
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
}]).service('PropertyResultsService',['$http', 'servicesBaseUrl', function($http, servicesBaseUrl) {

    this.getProperties = function (getPropertiesRequest) {
        return $http.get(servicesBaseUrl+'/properties/'+getPropertiesRequest.city+'/'+getPropertiesRequest.locality);
    };
	
	this.getPropertyDetails = function (propertyId) {
        return $http.get(servicesBaseUrl+'/properties/'+propertyId);
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
				
				if((filterOption.purpose && "Rent" !== property.mode) 
					|| (filterOption.hasOwnProperty("purpose") && !filterOption.purpose && "Sell" !== property.mode)) {
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
})
.filter('ordinal', function() {
  return function(input) {
    return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z]/g, ' $&');
  }
})
.filter('currencyFormatter', function() {
  return function(value) {
	var temp=value.toString(), index = temp.indexOf(".");
	
	if(index > -1) {
		temp = str.substring(0, index);
	}

	var lastThree = temp.substring(temp.length-3);
	var otherNumbers = temp.substring(0,temp.length-3);
	if(otherNumbers != '')
		lastThree = ',' + lastThree;
	return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  }
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
									zoom: 15,
									center: new google.maps.LatLng(17.3918335, 78.4732169),
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


