'use strict';

angular.module('properties', [])

.controller('PropertiesCtrl',['$scope', '$routeParams', 'PropertiesService', 'FatHomeUtil', 'LocationService', '$location',
	function($scope, $routeParams, propertiesService, fatHomeUtil, locationService, $location) {
	
    $scope.user.city = $scope.city = $scope.newCity = $routeParams.city;
	$scope.user.locality = $scope.locality = $scope.newLocality = $routeParams.locality;
	
	$scope.properties = [];
	$scope.sortOptions = fatHomeUtil.propertySortOptions();
	$scope.bedRoomsDropDownValues = fatHomeUtil.bedRoomsDropDownValues();
	$scope.propertyTypes = fatHomeUtil.propertyTypes();
	$scope.propertySubTypeMapper = fatHomeUtil.propertySubTypeMapper();
	$scope.unitOptions = fatHomeUtil.unitOptions();
	$scope.predicate = {};
	
	if(!$scope.fatHome.cities) {
		locationService.getCities()
			.success(function(data){
				$scope.fatHome.cities = data;
				$scope.getLocalities($scope.city);
			}).error(function(e){
				
			});
	}
	
	$scope.openChangeLocationModal = function() {
		$scope.newCity = $scope.city;
		$scope.newLocality = $scope.locality;
		$scope.form1.submitted=false;
		$scope.showChangeLocationModal=true;
	}
	
	$scope.showProperties = function(city, locality) {
		$scope.form1.submitted=true;
		
		if($scope.form1.$valid) {
		
			$scope.user.city = $scope.city = city;
			$scope.user.locality = $scope.locality = locality;
		
			$scope.showChangeLocationModal = false;
			$location.path('/properties/' + city + '/' + locality, false);
			$scope.getProperties(city, locality);
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
				$scope.fatHome.localities = data;
				$scope.currentLocationDetails = fatHomeUtil.getLocationDetails(data, $scope.locality);
			}).error(function(e){
				
			});
	}
		
	if($scope.fatHome.localities) {
		$scope.currentLocationDetails = fatHomeUtil.getLocationDetails($scope.fatHome.localities, $scope.locality);
	}
		
    var getPropertiesRequest = {city:$routeParams.city, locality:$routeParams.locality};

	
	$scope.getProperties = function(city, locality) {
		propertiesService.getProperties(city, locality)
		.success(function(data){
			$scope.showPage = 'propertyResults';
			$scope.properties = data;
			$scope.predicate.dataField = 'createdDate';
			$scope.predicate.reverseOrder = true;
		}).error(function(e){
			
		});
	};
	
	$scope.getPropertyDetails = function(propertyId) {
	
		propertiesService.getPropertyDetails(propertyId)
		.success(function(data){
			$scope.showPage = 'propertyDetails';
			$scope.property = data;
		}).error(function(e){
			
		});
	
	};
	
	$scope.showPropertyDetails = function(propertyId) {
		$location.path('/properties/' + $scope.city + '/' + $scope.locality + '/' + propertyId, false);
		$scope.getPropertyDetails(propertyId);
	};
	
	$scope.showPropertyResults = function() {

		$location.path('/properties/' + $scope.city + '/' + $scope.locality, false);
		if($scope.properties && $scope.properties.length > 0) {
			$scope.showPage = 'propertyResults';
			return;
		}
	
		$scope.getProperties($scope.city, $scope.locality);
	}
	
	
	var showView = function() {
	
		$scope.user.city = $scope.city = $scope.newCity = $routeParams.city;
		$scope.user.locality = $scope.locality = $scope.newLocality = $routeParams.locality;
        var propertyId = $routeParams.propertyId;
	
		if(propertyId) {
			$scope.getPropertyDetails(propertyId);
			return;
		}
		$scope.getProperties($scope.city, $scope.locality);
	}
	
	
	
	showView();
	
}]).service('PropertiesService',['$http', 'servicesBaseUrl', function($http, servicesBaseUrl) {

    this.getProperties = function (city, locality) {
        return $http.get(servicesBaseUrl+'/properties/'+city+'/'+locality);
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

.filter('currencyFormatter', function() {
  return function(value) {
  
	if(!value) {
		return "";
	}
  
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
}).directive('propertyResults1', function() {
	return {
		replace:true,
		restrict: 'EA',
		templateUrl: 'modules/properties/html/property-results.html',
	};
}).directive('propertyDetails1', function() {
	return {
		replace:true,
		restrict: 'EA',
		templateUrl: 'modules/properties/html/property-details.html',
	};
});


