'use strict';

angular.module('registerProperty', [])
.controller('RegisterPropertyCtrl',['$scope', 'LocationService', 'FatHomeUtil', '$routeParams', 'RegisterPropertyService', '$rootScope',
	function($scope, locationService, fatHomeUtil, $routeParams, registerPropertyService, $rootScope) {
	
	if(!$scope.isUserLoggedin) {
		$rootScope.$broadcast('showLoginModal');
	}
	
	$scope.user.city = $scope.city = $routeParams.city;
	$scope.user.locality = $scope.locality = $routeParams.locality;
	
	$scope.registerPropertySuccess = false;
	
	var userDetails = $rootScope.userDetails;
	if(userDetails) {
		$scope.property = {
			user:{
				name: userDetails.name,
				type: userDetails.type,
				email: userDetails.email,
				phoneNumber: userDetails.phoneNumber,
				locality: userDetails.locality,
				city:userDetails.city,
				userId:userDetails._id
			}
		};
	
	} else {
		$scope.property = {user:{}};
	}
	
	$scope.$watch("userDetails",
		function(newValue, oldValue) {
			$scope.property.user = newValue;
	}, true);
    
	$scope.property.user.city = $scope.city;
	$scope.property.user.locality = $scope.locality;
	$scope.unitOptions = fatHomeUtil.unitOptions();
	$scope.hours = fatHomeUtil.hoursDropDownValues();
	$scope.ageOfPropertyOptions = fatHomeUtil.ageOfPropertyOptions();
	$scope.noOfUnits = fatHomeUtil.noOfUnitsDropDownValues();
	$scope.balconiesDropDownValues = fatHomeUtil.balconiesDropDownValues();
	$scope.bedRoomsDropDownValues = fatHomeUtil.bedRoomsDropDownValues();
	$scope.bathRoomsDropDownValues = fatHomeUtil.bathRoomsDropDownValues();
	$scope.flooringDropDownValues = fatHomeUtil.flooringDropDownValues();
	$scope.propertyTypes = fatHomeUtil.propertyTypes();
	$scope.propertySubTypeMapper = fatHomeUtil.propertySubTypeMapper();
	
	$scope.disableSubmitbtn = false;
	$scope.propertyImages = [];
	
	$scope.city = $scope.newCity = $routeParams.city;
	$scope.locality = $scope.newLocality = $routeParams.locality;
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
				$scope.populateCurrentLocationDetails();
			}).error(function(e){
				
			});
	}

	$scope.populateCurrentLocationDetails = function() {
	
		if($scope.currentLocationDetails 
			&& $scope.currentLocationDetails.city === $scope.property.user.city
			&& $scope.currentLocationDetails.locality === $scope.property.user.locality) {
			return;
		}
	
		$scope.currentLocationDetails = fatHomeUtil.getLocationDetails($scope.fatHome.localities, $scope.property.user.locality);
	}
	
	if($scope.fatHome.localities) {
		$scope.populateCurrentLocationDetails();
	}

	$scope.updatePropertyStatus = function() {
		if($scope.property.details.mode==='Sell') {
			$scope.property.details.propertyStatus='Resale';
		}
	}

	$scope.updateCoverPhotoIndex = function(index) {
		angular.forEach($scope.propertyImages, function (image, i) {
			if(i===index) {
				image.coverPhoto = true;
			} else {
				image.coverPhoto = false;
			}
		});
	}
	
	$scope.validateFirstForm = function() {
		$scope.form1.submitted=true;
		$scope.showForm2=$scope.form1.$valid;
		$scope.showForm1=!$scope.form1.$valid;
		if(!$scope.form1.$valid) {
			alert('Please enter all required fields');
		}
	}

	$scope.$watch("propertyImages",
		function(newValue, oldValue) {
		
			if(!$scope.propertyImages) {
				return;
			}
		
			var coverPhotoSelected;
			angular.forEach($scope.propertyImages, function (image, i) {
				if(image.coverPhoto) {
					coverPhotoSelected = true;
				} 
			});
			
			if(!coverPhotoSelected && $scope.propertyImages.length > 0) {
				$scope.updateCoverPhotoIndex(0);
			}
	}, true);
	
	$scope.selectFirstAsCoverPhoto = function() {
		angular.forEach($scope.propertyImages, function (image, i) {
			if(i===index) {
				image.coverPhoto = true;
			} else {
				image.coverPhoto = false;
			}
		});
	}
	
	
    $scope.registerProperty = function () {
	
		$scope.disableSubmitbtn = true;
	   
		var request = {
			property: adjustProperty($scope.property),
			images: {
				userImage:$scope.userImage,
				propertyImages: $scope.propertyImages
			}
		}
	   $rootScope.$broadcast('SHOW_PROGRESS_BAR');
       registerPropertyService.registerProperty(angular.toJson(request))
       	    .success(function(data){
				$scope.registerPropertySuccess = true;
				$rootScope.$broadcast('HIDE_PROGRESS_BAR');
		    }).error(function(e){
				$scope.disableSubmitbtn = true;
				$rootScope.$broadcast('HIDE_PROGRESS_BAR');
				
		    });
    };
	
	
	var adjustProperty = function(property) {
		property.createdDate = new Date();
	
		if(property.details.area.builtUp) {
			property.details.area.builtUp.builtUpInSqft = fatHomeUtil.getSqftMutiplier(property.details.area.builtUp.units)*Number(property.details.area.builtUp.builtUp);
		}
		
		if(property.details.area.plotOrLand) {
			property.details.area.plotOrLand.plotOrLandInSqft = fatHomeUtil.getSqftMutiplier(property.details.area.plotOrLand.units)*Number(property.details.area.plotOrLand.plotOrLand);
		}
		
		if(property.details.area.carpet) {
			property.details.area.carpet.carpetInSqft = fatHomeUtil.getSqftMutiplier(property.details.area.carpet.units)*Number(property.details.area.carpet.carpet);
		}
	
		property.details.title = fatHomeUtil.convertToCamelCase(property.details.title);
		
		
		if(property.details.availability === "Ready to Move" && property.details.date) {
			delete property.details.date;
		}

		if(property.specifications
			&& property.specifications.parking
			&& property.specifications.parking.fourWheeler 
			&& !property.specifications.parking.fourWheeler.covered) {
			delete property.specifications.parking.fourWheeler;
		}
		
		if(property.specifications
			&& property.specifications.parking
			&& property.specifications.parking.twoWheeler 
			&& !property.specifications.parking.twoWheeler.covered) {
			delete property.specifications.parking.twoWheeler;
		}

		return property;
	}
	
	$scope.validateFloors = function(totalFloors, floorNumber) {
		
		$scope.form2.floorNumber.$error.invalidFloorNumber = false;
		if(!totalFloors || !floorNumber) {
			return;
		}
		form2.totalFloors.$valid = true;
		if(form2.totalFloors.$valid && Number(totalFloors) < Number(floorNumber)) {
			$scope.form2.floorNumber.$error.invalidFloorNumber = true;
			form2.totalFloors.$valid = false;
		}
	}
	
	
	
	
	
	
	
}])
.service('RegisterPropertyService',['$http',  'servicesBaseUrl', function($http, servicesBaseUrl) {
    this.registerProperty = function (property) {
        return $http.post(servicesBaseUrl+'/properties', property);
    };
}])
.directive('scroll', function() {
	var scrollPos;
	return {
		restrict: 'EA',
		link:function(scope, el) {
						
			scope.$watch("showForm1",
				function(newValue, oldValue) {
					if(newValue)
						$(window).scrollTop(0);
				});
			
			scope.$watch("showForm2",
				function(newValue, oldValue) {
					if(newValue)
						$(window).scrollTop(0);
				}, true);

			scope.$watch("showForm3",
				function(newValue, oldValue) {
					if(newValue)
						$(window).scrollTop(0);
				}, true);
		}
	};
})
.directive('datePicker', function () {
	return {
		restrict: 'EA',
		require : 'ngModel',
		link : function (scope, element, attrs, ngModelCtrl) {
			$(function(){
				element.datepicker({
					dateFormat:'mm-dd-yy',
					onSelect:function (date) {
						ngModelCtrl.$setViewValue(element.datepicker("getDate"));
						scope.$apply();
					},
					onClose: function (dateText, inst) {
						if(!dateText) {
							ngModelCtrl.$setViewValue(null);
						}
						
						scope.$apply();
					},
					minDate:new Date() 
				});
				//element.datepicker("setDate", new Date());
			});
		}
	};
})
.directive('pinProperty', function() {
	return {
		restrict: 'EA',
		scope:{
			location:"=",
			property:"=",
			resizeMap:"="
		},
		link:function(scope, el) {
			var map;
			var initializeMap = function () {	
			
				if(!scope.location) {
					return;
				}
			
				var mapOptions = {
									zoom: 15,
									center: new google.maps.LatLng(scope.location.lat, scope.location.long),
									mapTypeId: google.maps.MapTypeId.ROADMAP
								};
				var map = new google.maps.Map(el[0], mapOptions);
				
				var marker = new google.maps.Marker({
					position: map.getCenter(),
					map: map,
					animation: google.maps.Animation.BOUNCE,
					draggable:true

				});

				var info = new google.maps.InfoWindow({
					content:''

				})

				info.open(map, marker);
				google.maps.event.addListener(marker, 'dragend', function(e)
				{
					if(!scope.property.location) {
						scope.property.location = {};
					}
					info.setContent('Latitude : '+ e.latLng.lat() +' '+'Longittude : '+ e.latLng.lng());
					scope.property.location.lat= e.latLng.lat();
					scope.property.location.lng= e.latLng.lng();
					
					google.maps.event.removeListener(centerChangeListener);
				});
				
				
				var centerChangeListener = google.maps.event.addListener(map, 'center_changed', function() {
					if(map.getZoom() < 15) {
						return;
					}
					
					marker.setPosition(map.getCenter());
				});
			}

			var previousLocation;
			scope.$watch(function() {
				if(scope.location && previousLocation !== scope.location && scope.resizeMap) {
					previousLocation = scope.location;
					initializeMap();
				}
			});
			
	
		}
	};
});