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
	$scope.search = {};
	
	$scope.addImages = ["images/a1_old.jpg", "images/a2.jpg", "images/a3.jpg"];
	
	if(!$scope.fatHome.cities) {
		locationService.getCities()
			.success(function(data){
				$scope.fatHome.cities = data;
				$scope.getLocalities($scope.city);
			}).error(function(e){
				
			});
	}
	
	$scope.$watch("search",
		function(newValue, oldValue) {
			$scope.showPage = 'propertyResults';
		}, true
	);
	
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
			$scope.populateCurrentLocationDetails();
		}
	}
	
	$scope.getLocalities = function(city) {
	
		if(!city) {
			$scope.localities = [];
			return;
		}
	
		locationService.getLocalities(city)
			.success(function(data){
				$scope.fatHome.localities = data;
				$scope.populateCurrentLocationDetails();
			}).error(function(e){
				
			});
	}

	$scope.populateCurrentLocationDetails = function() {
	
		if($scope.currentLocationDetails 
			&& $scope.currentLocationDetails.city === $scope.city
			&& $scope.currentLocationDetails.locality === $scope.locality) {
			return;
		}
	
		$scope.currentLocationDetails = fatHomeUtil.getLocationDetails($scope.fatHome.localities, $scope.locality);
	}
	
	if($scope.fatHome.localities) {
		$scope.populateCurrentLocationDetails();
	}
    var getPropertiesRequest = {city:$routeParams.city, locality:$routeParams.locality};

	
	$scope.getProperties = function(city, locality) {
		propertiesService.getProperties(city, locality)
		.success(function(data){
			$scope.showPage = 'propertyResults';
			$scope.properties = data;
			$scope.property = null;
			$scope.predicate = $scope.sortOptions[0];
		}).error(function(e){
			
		});
	};
	
	$scope.getPropertyDetails = function(propertyId) {
		$scope.property = null;
		propertiesService.getPropertyDetails(propertyId)
		.success(function(data){
			$scope.showPage = 'propertyDetails';
			
			$scope.property = data;
			showAreaDropDowns(data);
			$scope.showDetailsTab = true;
		}).error(function(e){
			
		});
	
	};
	
	var showAreaDropDowns = function(property) {
	
		if(property.details.area.builtUp) {
			$scope.builtUpArea = property.details.area.builtUp.builtUp;
			$scope.builtUpUnits = property.details.area.builtUp.units;
		}
		
		if(property.details.area.plotOrLand) {
			$scope.plotOrLandArea = property.details.area.plotOrLand.plotOrLand;
			$scope.plotOrLandUnits = property.details.area.plotOrLand.units;
		}
		
		if(property.details.area.carpet) {
			$scope.carpetArea = property.details.area.carpet.carpet;
			$scope.carpetUnits = property.details.area.carpet.units;
		}
	
	
	}
	
	$scope.covert = function(units, value) {
		return (Number(value)/fatHomeUtil.getSqftMutiplier(units)).toFixed(2);
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
				
				if(!filterOption.buy && "Sell" === property.mode) {
					continue;
				}
				
				if(!filterOption.rent && "Rent" === property.mode) {
					continue;
				}
								
				if(filterOption.minSft && Number(filterOption.minSft) > Number(property.builtUpInSqft)) {
					continue;
				}
				
				if(filterOption.maxSft && Number(filterOption.maxSft) < Number(property.builtUpInSqft)) {
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
		
		if('createdDate' === field) {
			return (tempa > tempb ? 1 : -1);
		}
		
		return (Number(tempa) > Number(tempb) ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
})

.filter('currencyFormatter', ['FatHomeUtil', function(fatHomeUtil) {
  return fatHomeUtil.currencyFormater;
}]).directive('propertyResults', function() {
	return {
		replace:true,
		restrict: 'EA',
		templateUrl: 'modules/properties/html/property-results.html',
	};
}).directive('propertyDetails', function() {
	return {
		replace:true,
		restrict: 'EA',
		templateUrl: 'modules/properties/html/property-details.html',
	};
})
.directive('checkbox', function() {
	return {
		restrict: 'EA',
		link:function(scope, el) {
			el.each(function(){
				$(this).wrap( "<span class='custom-checkbox'></span>" );
				if($(this).is(':checked')){
					$(this).parent().addClass("selected");
				}
			});
			el.click(function(){
				$(this).parent().toggleClass("selected");
			});
		}
	};
})
.directive('map', ['FatHomeUtil', function(fatHomeUtil) {

	function PropertiesMap(map) {
		var previousMarker;
		this.markers = [];
		this.propertyMarkerMap = {};
		
		this.addMarker = function(property, clickHandler) {

		  var marker = new google.maps.Marker({
			position: new google.maps.LatLng(property.lat, property.lng),
			map: map
		  });
		  
		  var chInfoWindow = new google.maps.InfoWindow({
			content: "Title : "+property.title+"<br>"
					+"Bedrooms : "+property.bedRooms+"<br>"
					+"Area : "+property.builtUpSize+" "+property.builtUpUnits+"<br>"
					+"Price : <label class='fa fa-rupee'> "+fatHomeUtil.currencyFormater(property.price)+"</label>",
			maxWidth:250
		  });
		  
		  google.maps.event.addListener(marker, 'mouseover', function() {
			chInfoWindow.open(map, marker);
		  });
		  
		  google.maps.event.addListener(marker, 'mouseout', function() {
				if (chInfoWindow) {
					chInfoWindow.close();
				}
		  });
		  
		  
		  google.maps.event.addListener(marker, 'click', function() {
			makeMarkerAsSelected(marker);
			clickHandler(property._id);
		  });
		  
		  this.markers.push(marker);
		  this.propertyMarkerMap[property._id] = marker;
		}
		
		this.clearMarkers = function() {
		  this.setAllMap(null);
		}

		this.setAllMap = function(map) {
		  for (var i = 0; i < this.markers.length; i++) {
			this.markers[i].setMap(map);
		  }
		}
		
		this.setPropertyMarkerAsSelected = function(property) {
			makeMarkerAsSelected(this.propertyMarkerMap[property._id]);
		}
		
		this.resetMarkerSelection = function() {
			if(previousMarker) {
				previousMarker.setIcon('https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1');
			}
		}
		
		
		var makeMarkerAsSelected = function(marker) {
		
			if(!marker) {
				return;
			}
		
			if(previousMarker) {
				previousMarker.setIcon('https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1');
			}
			
			marker.setIcon('https://www.google.com/mapfiles/marker_green.png');
			previousMarker = marker;
		}
		
	};

	return {
		restrict: 'EA',
		link:function(scope, el) {
			
			var propertiesMap, initializeMap = function (locationDetails) {	
			
				var mapOptions = {
									zoom: 15,
									center: new google.maps.LatLng(locationDetails.lat, locationDetails.long),
									mapTypeId: google.maps.MapTypeId.ROADMAP
								};
				map = new google.maps.Map(el[0], mapOptions);
				propertiesMap = new PropertiesMap(map);
			}
			
			var showMarkers = function (properties) {	
				
				if(propertiesMap) {
					propertiesMap.clearMarkers();
				}
				
				for (var i = 0; i <properties.length; i++) { 
					var property = properties[i];
					propertiesMap.addMarker(property, scope.getPropertyDetails);
				}
			}
			
			var properties, property;
			var propertiesChangeHandler = function(newValue) {
				properties = newValue;
				if(propertiesMap) {
					showMarkers(newValue);
				}
			}
			
			var propertyChangeHandler = function(newProperty) {
				property = newProperty;
				if(newProperty && propertiesMap) {
	
					var newOptimizedProperty = {};
					newOptimizedProperty._id = newProperty._id;
					newOptimizedProperty.title = newProperty.details.title;
					if (newProperty.location) {
						newOptimizedProperty.lat = newProperty.location.lat;
						newOptimizedProperty.lng = newProperty.location.lng;
					}
					
					if(newProperty.details.price) {
						newOptimizedProperty.price = newProperty.details.price.price;
					} else {
						newOptimizedProperty.price = newProperty.details.monthlyRent;
					}
					
					newOptimizedProperty.bedRooms = newProperty.details.bedRooms;
					newOptimizedProperty.builtUpSize = newProperty.details.area.builtUp.builtUp;
					newOptimizedProperty.builtUpUnits = newProperty.details.area.builtUp.units;
	
					
					if(!properties || properties.length == 0) {
						properties = [newOptimizedProperty];
						propertiesChangeHandler(properties);
					}
					
					if(propertiesMap)
						propertiesMap.setPropertyMarkerAsSelected(property);
				}
			}
			
			
			
			scope.$watch("filteredProperties", propertiesChangeHandler, true);
			scope.$watch("property", propertyChangeHandler, true);
			
			scope.$watch("showPage",
				function(newValue, oldValue) {
					if(newValue === 'propertyResults' && propertiesMap)
						propertiesMap.resetMarkerSelection();
				});
			
			scope.$watch("currentLocationDetails", function(newValue, oldValue) {
				if(newValue) {
					console.log(angular.toJson(newValue));
					initializeMap(newValue);
					
					if(properties) {
						propertiesChangeHandler(properties);
					}
					
					if(property) {
						propertyChangeHandler(property);
					}
				}
			}, true);
		
		}
	};
}])
.directive('scroll', function() {
	var scrollPos;
	return {
		restrict: 'EA',
		link:function(scope, el) {
			el.scroll(function() {
				scrollPos = el.scrollTop();
			});
			
			scope.$watch("showPage",
				function(newValue, oldValue) {
					if(newValue === 'propertyResults')
						el.scrollTop(scrollPos);
				});
			
			scope.$watch("predicate",
				function(newValue, oldValue) {
					el.scrollTop(0);
				}, true);

			scope.$watch("search",
				function(newValue, oldValue) {
					el.scrollTop(0);
				}, true);
		}
	};
});


