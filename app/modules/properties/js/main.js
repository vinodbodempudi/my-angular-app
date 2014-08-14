'use strict';

angular.module('properties', [])

.controller('PropertiesCtrl',['$scope', '$routeParams', 'PropertiesService', 'FatHomeUtil', 'LocationService', '$location', '$rootScope', 
	function($scope, $routeParams, propertiesService, fatHomeUtil, locationService, $location, $rootScope) {
	
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
	$scope.slides  = [];
	
	var addsImages = fatHomeUtil.getAddsImages();
	
	$scope.firstBlockAdds = addsImages.slice(0, 3);
	$scope.secondBlockAdds = addsImages.slice(3, 6);
	$scope.thirdBlockAdds = addsImages.slice(6, 9);
	
	
	
	$scope.$on('locationChangeSuccess', function (event, path) {
		if(path && path.match('properties')) {
			var arr = path.split("/");
			if(arr.length > 4) {
				$scope.showPage = 'propertyDetails';
				$scope.getPropertyDetails(arr[4]);
				return;
			} 
			$scope.showPage = 'propertyResults';
		}
	});
	
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
	
	$scope.$watch("propertyDetails",
		function(newValue, oldValue) {
			if(newValue) {
				setPropertyImages();
			}
		}, true
	);
	
	$scope.openChangeLocationModal = function() {
		$scope.newCity = $scope.city;
		$scope.newLocality = $scope.locality;
		$scope.form1.submitted=false;
		$scope.showChangeLocationModal=true;
	}
	
	$scope.showProperties = function(city, locality) {
		$scope.user.city = $scope.city = city;
		$scope.user.locality = $scope.locality = locality;
	
		$scope.showChangeLocationModal = false;
		$location.path('/properties/' + city + '/' + locality, false);
		$scope.getProperties(city, locality);
		$scope.populateCurrentLocationDetails();
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
			$scope.predicate = $scope.sortOptions[0];
		}).error(function(e){
			
		});
	};
	
	$scope.isGetPropertyDetailsServiceInProgress = false;
	$scope.getPropertyDetails = function(propertyId) {
	
		if($scope.isGetPropertyDetailsServiceInProgress) {
			return;
		}

		$scope.isGetPropertyDetailsServiceInProgress = true;
		propertiesService.getPropertyDetails(propertyId)
		.success(function(data){
			$scope.isGetPropertyDetailsServiceInProgress = false;
			$scope.showPage = 'propertyDetails';
			
			$scope.property = data;
			showAreaDropDowns(data);
			setPropertyDetailsTab();
			
			if($scope.propertyDetails.showPhotosTab) {
				setPropertyImages();
			}
			
		}).error(function(e){
			$scope.isGetPropertyDetailsServiceInProgress = false;
		});
	
	};
	
	var setPropertyDetailsTab = function() {
		if(!$scope.propertyDetails) {
			$scope.propertyDetails = {
				showDetailsTab:true,
				showSpecificationsTab:false,
				showAmenitiesTab:false,
				showPhotosTab:false,
				showContactTab:false
			};
		} else if(!$scope.propertyDetails.showDetailsTab
			&& !$scope.propertyDetails.showSpecificationsTab
			&& !$scope.propertyDetails.showAmenitiesTab
			&& !$scope.propertyDetails.showPhotosTab
			&& !$scope.propertyDetails.showContactTab){
			$scope.propertyDetails.showDetailsTab = true;
		}
	}
	
	var setPropertyImages = function() {
		if($scope.property.urls 
			&& $scope.property.urls.propertyUrls 
			&& $scope.property.urls.propertyUrls.length > 0
			&& $scope.slides !== $scope.property.urls.propertyUrls) {
				$scope.slides = [];
				angular.forEach($scope.property.urls.propertyUrls, function(propertyUrl, key) {
					if(propertyUrl) {
						$scope.slides.push(propertyUrl);
					}
				});
		} else {
			$scope.slides = [];
		}
	}
	
	var showAreaDropDowns = function(property) {
		resetAreaDropDowns();
		if(property.details.area.builtUp) {
			$scope.builtUp.builtUpArea = property.details.area.builtUp.builtUp;
			$scope.builtUp.builtUpUnits = property.details.area.builtUp.units;
		}
		
		if(property.details.area.plotOrLand && property.details.area.plotOrLand.plotOrLand) {
			$scope.plotOrLand.plotOrLandArea = property.details.area.plotOrLand.plotOrLand;
			$scope.plotOrLand.plotOrLandUnits = property.details.area.plotOrLand.units;
		}
		
		if(property.details.area.carpet) {
			$scope.carpet.carpetArea = property.details.area.carpet.carpet;
			$scope.carpet.carpetUnits = property.details.area.carpet.units;
		}
	}
	
	var resetAreaDropDowns = function() {
		$scope.builtUp={};
		$scope.plotOrLand={};
		$scope.carpet={};
	}
	
	$scope.covert = function(units, value) {
		return (Number(value)/fatHomeUtil.getSqftMutiplier(units)).toFixed(4);
	};
	
	$scope.showPropertyDetails = function(propertyId) {
		$location.path('/properties/' + $scope.city + '/' + $scope.locality + '/' + propertyId, false);
		$scope.getPropertyDetails(propertyId);
	};
	
	$scope.showPropertyResults = function() {

		$location.path('/properties/' + $scope.city + '/' + $scope.locality, false);
		$scope.property = null;
		resetAreaDropDowns();
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
			propertiesService.getProperties($scope.city, $scope.locality)
				.success(function(data){
					$scope.predicate = $scope.sortOptions[0];
					$scope.showPage = 'propertyDetails';
					$scope.properties = data;
					$scope.getPropertyDetails(propertyId);
				}).error(function(e){
					
				});
			
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
            var tempProperties = [], property, propertyPrice;
			for (var i = 0; i < properties.length; i++) { 
				property = properties[i];
				if(filterOption.propertType && filterOption.propertType !== property.details.propertySubType) {
					continue;
				}
				
				if(filterOption.beds && Number(filterOption.beds) !== Number(property.details.bedRooms)) {
					continue;
				}
				
				if(filterOption.minPrice) {
				
					if(property.details.mode==='Sell') {
						propertyPrice = property.details.price.price;
					} else {
						propertyPrice = property.details.monthlyRent;
					}
				
					if(Number(filterOption.minPrice) > Number(propertyPrice)) {
						continue;
					}
				}
				
				if(filterOption.maxPrice) {
				
					if(property.details.mode==='Sell') {
						propertyPrice = property.details.price.price;
					} else {
						propertyPrice = property.details.monthlyRent;
					}
				
					if(Number(filterOption.maxPrice) < Number(propertyPrice)) {
						continue;
					}
				}
				
				if(!filterOption.buy && "Sell" === property.details.mode) {
					continue;
				}
				
				if(!filterOption.rent && "Rent" === property.details.mode) {
					continue;
				}
								
				if(filterOption.minSft && Number(filterOption.minSft) > Number(property.details.area.builtUp.builtUpInSqft)) {
					continue;
				}
				
				if(filterOption.maxSft && Number(filterOption.maxSft) < Number(property.details.area.builtUp.builtUpInSqft)) {
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
		var tempa, tempb;
		
		if(field === 'price') {
			if(a.details.mode==='Sell') {
				 tempa = a.details.price.price;
			} else {
				tempa = a.details.monthlyRent;
			}
			
			if(b.details.mode==='Sell') {
				 tempb = b.details.price.price;
			} else {
				tempb = b.details.monthlyRent;
			}
		}

		if(field === 'size') {
			tempa = a.details.area.builtUp.builtUpInSqft;
			tempb = b.details.area.builtUp.builtUpInSqft;
		}
		
		if(field === 'createdDate') {
			tempa = a[field];
			tempb = b[field];
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
		scope:false,
		restrict: 'EA',
		templateUrl: 'modules/properties/html/property-results.html'
	};
}).directive('propertyDetails', function() {
	return {
		replace:true,
		restrict: 'EA',
		templateUrl: 'modules/properties/html/property-details.html'
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
		
		this.addMarker = function(property, resultsHandler, detailsHandler) {

		  var marker = new google.maps.Marker({
			position: new google.maps.LatLng(property.location.lat, property.location.lng),
			map: map,
			icon: 'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=0.70'
		  });
		  
		  var getPropertyPrice = function(property) {
				if(property.details.mode==='Sell') {
					 return property.details.price.price;
				}
				
				return property.details.monthlyRent;
			}
		  
		  var chInfoWindow = new google.maps.InfoWindow({
			content: "Title : "+property.details.title+"<br>"
					+"Bedrooms : "+property.details.bedRooms+"<br>"
					+"Area : "+property.details.area.builtUp.builtUp+" "+property.details.area.builtUp.units+"<br>"
					+"Price : <label class='fa fa-rupee'> "+fatHomeUtil.currencyFormater(getPropertyPrice(property))+"</label>"
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
		  
			if(marker === previousMarker) {
				resultsHandler();
				previousMarker.setIcon('https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=0.70');
				previousMarker = null;
				return;
			}
		  
			makeMarkerAsSelected(marker);
			detailsHandler(property._id);
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
				previousMarker.setIcon('https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=0.70');
			}
		}
		
		
		var makeMarkerAsSelected = function(marker) {
		
			if(!marker) {
				return;
			}
		
			if(previousMarker) {
				previousMarker.setIcon('https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=0.70');
			}
			
			marker.setIcon('../images/green-marker.png');
			previousMarker = marker;
			

			//map.panTo(marker.getPosition());
			/* var scale = Math.pow(2, map.getZoom());
			var proj = map.getProjection();
			var bounds = map.getBounds();


			 var nw = proj.fromLatLngToPoint(
			  new google.maps.LatLng(
				bounds.getNorthEast().lat(),
				bounds.getSouthWest().lng()
			  ));

			var point = proj.fromLatLngToPoint(marker.getPosition());

			var nw1 = new google.maps.Point(
			  Math.floor((point.x - nw.x) * scale),
			  Math.floor((point.y - nw.y) * scale));
			 map.panBy(nw1.x, nw1.y);*/
			  
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
				var map = new google.maps.Map(el[0], mapOptions);
				propertiesMap = new PropertiesMap(map);
			}
			
			var showMarkers = function (properties) {	
				
				if(propertiesMap) {
					propertiesMap.clearMarkers();
				}
				
				for (var i = 0; i <properties.length; i++) { 
					var property = properties[i];
					if(!property.location) {
						continue;
					}
					
					propertiesMap.addMarker(property, scope.showPropertyResults, scope.showPropertyDetails);
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
	
					if(!properties || properties.length == 0) {
						properties = [newProperty];
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


