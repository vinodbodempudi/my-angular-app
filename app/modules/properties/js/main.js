'use strict';

angular.module('properties', [])

.controller('PropertiesCtrl',['$scope', '$routeParams', 'PropertiesService', 'FatHomeUtil', 'LocationService', '$location', '$rootScope', 
	'$timeout', 'ExternalService', function($scope, $routeParams, propertiesService, fatHomeUtil, locationService, $location, $rootScope, $timeout, externalService) {
	
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
	
	$scope.$watch("propertyDetails.showPhotosTab",
		function(newValue) {
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

	$scope.$on('refreshResults', function() {
		$scope.getProperties($scope.city, $scope.locality);
	});
	
	$scope.getProperties = function(city, locality) {
		propertiesService.getProperties(city, locality)
		.success(function(data){
			$scope.showPage = 'propertyResults';
			$scope.properties = data;
			$scope.predicate = $scope.sortOptions[0];
		}).error(function(e){
			
		});
	};
	
	$scope.showSendSmsView = function() {
		$scope.contactTabScrollBottom = true;
		$scope.defaultMessage="I am interested in your property posted in fathome.in. Please call me on";
		var property = $scope.property, smsDetails={toPhoneNumbers:[], message:$scope.defaultMessage};

		if(property.user.phoneNumber) {
			smsDetails.toPhoneNumbers.push(property.user.phoneNumber);
		}
		
		if(property.user.primaryPhoneNumber) {
			smsDetails.toPhoneNumbers.push(property.user.primaryPhoneNumber);
		}
		
		if(property.user.secondaryPhoneNumber) {
			smsDetails.toPhoneNumbers.push(property.user.secondaryPhoneNumber);
		}
		
		if($rootScope.isUserLoggedin) {
			smsDetails.phoneNumber = $rootScope.userDetails.phoneNumber;
			smsDetails.userId = $rootScope.userDetails._id;
		}
		smsDetails.propertyUrl = escape($location.absUrl());
		$scope.smsDetails = smsDetails;
		$scope.showSendSmsViewBox = true;
	};
	
	$scope.hideSendSmsViewBox = function() {
		$scope.showSendSmsViewBox=false;
		$scope.contactTabScrollBottom = false;
	}

	$scope.sendSms = function(validForm, request) {

		if(validForm) {
		
			var smsDetails = angular.copy(request);
		
			if(smsDetails.message && smsDetails.message.trim()) {
				smsDetails.message += " +91-" + smsDetails.phoneNumber;
			} else {
				smsDetails.message += $scope.defaultMessage + " +91-"+ smsDetails.phoneNumber;
			}
			smsDetails.message = escape(smsDetails.message);
			
		
			externalService.sendSms(angular.toJson(smsDetails))
			.success(function(data){
				$scope.showSendSmsSuccessMessage = true;
				$scope.showSendSmsViewBox = false;
				$scope.contactTabScrollBottom = false;
			}).error(function(e){
				console.log(e);
				alert("Send SMS failed. Please try after sometime.");
			});
			
		}
	};
	
	$scope.isGetPropertyDetailsServiceInProgress = false;
	$scope.getPropertyDetails = function(propertyId) {
	
		if($scope.isGetPropertyDetailsServiceInProgress) {
			return;
		}

		$scope.isGetPropertyDetailsServiceInProgress = true;
		$scope.slides = [{"url":"images/ajax-loader-small.GIF"}];
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
			
			$scope.isValidMaitenanceFee = isValidAmount(data.details.maintenanceFee);
			
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
	
		$timeout(function() {
			if($scope.property.urls 
				&& $scope.property.urls.propertyUrls 
				&& $scope.property.urls.propertyUrls.length > 0
				&& $scope.slides !== $scope.property.urls.propertyUrls) {
					$scope.slides = [];
					angular.forEach($scope.property.urls.propertyUrls, function(propertyUrl) {
						if(propertyUrl) {
							$scope.slides.push(propertyUrl);
						}
					});
			} else {
				$scope.slides = [{}];
			}
		}, 0);

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
	
	var isValidAmount = function(amount) {

		if(amount == undefined || amount.toString().length == 0) {
			return false;
		}
		
		if(Number(amount) >= 0) {
			return true;
		}
		return false;
	}
	
	
	
	
	showView();
	
}]).service('PropertiesService',['$http', 'servicesBaseUrl', function($http, servicesBaseUrl) {

    this.getProperties = function (city, locality) {
        return $http.get(servicesBaseUrl+'/properties/'+city+'/'+locality);
    };
	
	this.getPropertyDetails = function (propertyId) {
        return $http.get(servicesBaseUrl+'/properties/'+propertyId);
    };
	
	this.getMyProperties = function (userId, email) {
        return $http.get(servicesBaseUrl+'/properties/my-properties/'+userId+'/'+email);
    };
	
	this.updateProperty = function (request) {
        return $http.post(servicesBaseUrl+'/properties/update-property', request);
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
			tempa = a.lastUpdatedDate || a[field];
			tempb = b.lastUpdatedDate || b[field];
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
.filter('maskNumber', function() {
  return function(input, maskNumber) {
  
	if(!maskNumber) {
		return input;
	}
	
	return input.substr(0, 4)+'XXXXXX';
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
.directive('propertyImage', function() {
	return {
		restrict: 'EA',
		scope:{
			url:"="
		},
		template:"<div style='margin: 0px auto; height: 200px;top: 68px; position: relative;'><img style='width:64px;height:64px;' src='images/ajax-loader-small.GIF' ng-show='url.url'></div><img ng-src='{{url.url}}' ng-show='url.url' style='margin:auto;width: auto; height: 200px; max-height: 200px;'>",
		link:function(scope, el) {
			var propertyImage = angular.element(el.children()[1]), imageLoader = angular.element(el.children()[0]);
			
			if(scope.url.url && scope.url.url.indexOf('images/ajax-loader-small.GIF') !=-1) {
				propertyImage.hide();
				imageLoader.show();
			}
			
			propertyImage.load(function() {
				if(scope.url.url && scope.url.url.indexOf('images/ajax-loader-small.GIF') == -1) {
					imageLoader.hide();
					propertyImage.show();
				} else {
					propertyImage.hide();
					imageLoader.show();
				}
			}).each(function() {
			  if(this.complete) $(this).load();
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
			content: "<div class='scroll-fix'>"
						+"Title : "+property.details.title+"<br>"
						+"Bedrooms : "+property.details.bedRooms+"<br>"
						+"Area : "+property.details.area.builtUp.builtUp+" "+property.details.area.builtUp.units+"<br>"
						+"Price : <label class='fa fa-rupee'> "+fatHomeUtil.currencyFormater(getPropertyPrice(property))+"</label>"
					+"</div>"
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
									zoom: 14,
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
					if(newValue === 'propertyResults') {
						//el.scrollTop(scrollPos);
						setTimeout(function() { document.getElementById('propertyResults').scrollTop = scrollPos; }, 0);
					}
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
})
.directive('scrollbottom', function() {
	var scrollPos;
	return {
		restrict: 'EA',
		scope: {
			scrollToBottom:"="
		},
		link:function(scope, el) {
			scope.$watch("scrollToBottom", function(newValue, oldValue) {
				if(newValue) {
					el.animate({ scrollTop: el[0].scrollHeight}, 1000);
				}
			}, true);
		}
	};
})
.directive('popOver', ['$compile', 'FatHomeAppStateUtil', '$rootScope', 'PropertiesService', 'FatHomeUtil', '$window', function ($compile, fatHomeAppStateUtil, $rootScope, propertiesService, fatHomeUtil, $window) {
  var propertiesTemplate = "<div class='mylist-popover'><img ng-show='getMyListServiceCallInprogress' style='width:64px;height:64px;margin: 0 auto;display: inherit;' src='images/ajax-loader-small.GIF'><div class='row resutls' ng-show='!getMyListServiceCallInprogress'><div class='text-center' ng-show='properties.length == 0;'><h4> No results found.</h4> </div><div ng-repeat='property in properties=(properties | sortPropertyResults:predicate.dataField:predicate.reverseOrder)'> <div class='list-view' style='cursor:pointer;' ng-click='showPropertyDetails(property._id);'> <div class='image' ng-show='!property.urls.coverPhotoUrl.url'> <img ng-src='images/list1.png' alt='' /> </div> <div class='image' ng-show='property.urls.coverPhotoUrl.url'> <img ng-src='{{property.urls.coverPhotoUrl.url}}' alt='' /> </div> <div class='content'> <div class='row '> <div class='col-xs-7'> <h3><a href=''><label title='{{property.details.title}}' class='propertyresultsLabel'>{{property.details.title}}</label></a></h3> </div> <div class='col-xs-5 price' style='text-align:Right;'> <h4 ng-show='property.details.mode===sell'><i class='fa fa-rupee'></i> <span>{{property.details.price.price | currencyFormatter}}</span></h4> <h4 ng-show='property.details.mode===rent'><i class='fa fa-rupee'></i> <span>{{property.details.monthlyRent | currencyFormatter}}</span></h4> </div> </div> <div class='row properresultssqftlabel'> <div class='col-xs-12 price' style='textAlign:Right;'> <h5 style='text-align: right;' ng-show='property.details.mode===sell && property.details.area.perUnitPrice'><span>{{property.details.area.perUnitPrice | currencyFormatter}}/Sq.ft</span></h5> </div> </div> <div class='row firstRow'> <div class='col-xs-3'> <span>{{property.details.bedRooms}}</span> Beds </div> <div class='col-xs-3'> <span>{{property.details.bathRooms}}</span> Baths </div> <div class='col-xs-3'> <span>{{property.details.area.builtUp.builtUp | currencyFormatter}}</span> {{property.details.area.builtUp.units}} </div> </div> <div class='row secondRow'> <div class='col-xs-2'> <span>{{property.details.mode}}</span> </div> <div class='col-xs-5'> <span>{{property.details.propertySubType}}</span> </div> <div class='col-xs-5'> <i class='fa fa-map-marker'></i> <span>{{property.user.locality}}</span> </div> </div> <div class='row thirdRow customsocial' style='z-index:10;'> <div class='col-xs-8 text-center'> <button type='button' class='btn btn-default btn-sm btn-info my-list-button' ng-click='editProperty($event, property);'>Edit</button> <button type='button' class='btn btn-default btn-sm my-list-button btn-info' ng-click='deleteProperty($event, property._id, $index);'>Delete</button></div> <div class='col-xs-4 dateright'> <div ng-hide='property.lastUpdatedDate' class='text-right'>{{property.createdDate | date:'MMM d, y'}}</div><div ng-show='property.lastUpdatedDate' class='text-right'>{{property.lastUpdatedDate | date:'MMM d, y'}}</div> </div> </div> </div> <div class='clearfix'></div> </div> </div> </div> </div>";
  return {
    restrict: "A",
    transclude: true,
    template: "<div ng-transclude></div>",
    link: function (scope, element, attrs) {
		scope.sell = 'Sell';
		scope.rent = 'Rent';
		scope.predicate = fatHomeUtil.propertySortOptions()[0];
		scope.properties=[];
		scope.getMyListServiceCallInprogress = true;
		var popOverOptions = {
			content: $compile(propertiesTemplate)(scope),
			placement: "bottom",
			html: true,
			trigger:'manual',
			title: "My List"+ '<div class="pull-right"><button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-click="hideMyListModal()">×</button></div>',
		};
		$(element).popover(popOverOptions);
		
		scope.showPropertyDetails = function(propertyId) {
			hideMyListModal();
			fatHomeAppStateUtil.showPropertiesHome($rootScope.user.city, $rootScope.user.locality, propertyId, fatHomeAppStateUtil.isRegisterProperty() || fatHomeAppStateUtil.isEditProperty());
		};
		
		scope.editProperty = function($event, property) {
			$event.stopPropagation();
			propertiesService.getPropertyDetails(property._id)
			.success(function(data){
				hideMyListModal();
				$rootScope.editProperty = data;
				fatHomeAppStateUtil.showEditProperty(data.user.city, data.user.locality, property._id, true);
			}).error(function(e){

			});
		};
		
		var showingPopover = false;
		scope.showMyProperties = function($event) {
			$event.stopPropagation();
			if(showingPopover) {
				showingPopover = false;
				hideMyListModal();
				return;
			}
			
			if(!scope.isUserLoggedin) {
				$rootScope.showMyListPopover = true;
				$rootScope.$broadcast('showLoginModal');

				scope.$on('showMyListPopOver', function() {
					showMyProperties();
				});
				
				return;
			}

			showMyProperties();
			showMyListModal();
		};
		
		var showMyProperties = function() {
			
			scope.getMyListServiceCallInprogress = true;
			propertiesService.getMyProperties(scope.userDetails._id, scope.userDetails.email)
			.success(function(data){
				scope.getMyListServiceCallInprogress = false;
				scope.properties = data;
			}).error(function(e){
				scope.getMyListServiceCallInprogress = false;
			});
		};
	
		scope.deleteProperty = function($event, propertyId, $index) {
			$event.stopPropagation();
			if (window.confirm('Are you sure you want delete?')) {
				var request = {_id:propertyId, update:{active:'D'}}
				propertiesService.updateProperty(request)
				.success(function(data){
					refreshResults(scope.properties.splice($index, 1)[0]);
				}).error(function(e){

				});
			
				
			}
		};
		
		var refreshResults = function(removedProperty) {
			if(fatHomeAppStateUtil.isPropertiesHome() && removedProperty.user.locality == $rootScope.user.locality) {
				scope.$broadcast('refreshResults');
			}
		}
		
		var showMyListModal = function() {
			showingPopover = true;
			$(element).popover('show');
			$('html').on('click', function(e) {
				hideMyListModal();
			});
		}
		
		var hideMyListModal = function() {
			$(element).popover('hide');
			showingPopover = false;
			$('html').off('click');
		}
	}
  };
}]);


