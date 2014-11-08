'use strict';

angular.module('registerProperty', [])
.controller('RegisterPropertyCtrl',['$scope', 'LocationService', 'FatHomeUtil', '$routeParams', 'RegisterPropertyService', '$rootScope',
	'$modal', '$location', 'FatHomeAppStateUtil', function($scope, locationService, fatHomeUtil, $routeParams, registerPropertyService, $rootScope, $modal, $location, fatHomeAppStateUtil) {
	
	if(!$scope.isUserLoggedin) {
		$rootScope.$broadcast('showLoginModal');
	}
	
	$scope.user.city = $scope.city = $routeParams.city;
	$scope.user.locality = $scope.locality = $routeParams.locality;
	
	$scope.property = {user:{}};
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
	$scope.removedImages = [];
	var isEditProperty = fatHomeAppStateUtil.isEditProperty();
	
	$scope.city = $scope.newCity = $routeParams.city;
	$scope.locality = $scope.newLocality = $routeParams.locality;
	
	var setUserDetails = function(userDetails) {
		
		if(isEditProperty) {
			return;
		}

		$scope.property.user.name = userDetails.name;
		$scope.property.user.primaryEmail = userDetails.email;
		$scope.property.user.primaryPhoneNumber = userDetails.phoneNumber;
		$scope.property.user._id = userDetails._id;

		if(userDetails.type === 'Individual') {
			$scope.property.user.type = 'Owner';
		} else {
			$scope.property.user.type = userDetails.type;
		}
	
	}
	
	var userDetails = $rootScope.userDetails;
	if($rootScope.userDetails) {
		setUserDetails($rootScope.userDetails);
	}

	if(isEditProperty) {
		$scope.property = $rootScope.editProperty;

		if($scope.property.urls && $scope.property.urls.propertyUrls) {
			angular.forEach($scope.property.urls.propertyUrls, function (image, i) {
				$scope.propertyImages.push(image);
			});
		}
		
		if($scope.property.urls && $scope.property.urls.userUrl) {
			$scope.userImage = {url:$scope.property.urls.userUrl}
		}
		
	}
	
	$scope.$watch("userDetails",
		function(userDetails, oldValue) {
			if(!userDetails) {
				return;
			}
			setUserDetails(userDetails);
	}, true);
    
	
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
	
	$scope.validatePersonalDetailsForm = function() {
		$scope.form1.submitted=true;
		if(!$scope.form1.$valid) {
			alert('Please enter all required fields');
			return;
		}
		
		$scope.showForm1=false;
		if($scope.property.details.propertySubType === 'Land/Plot') {
			$scope.showForm3 = true;
			return;
		}
		
		$scope.showForm2=true;
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
	
		var request = {
			property: adjustProperty($scope.property),
			images: {
				userImage:$scope.userImage,
				propertyImages: $scope.propertyImages
			}
		}
		
		if(isEditProperty) {
			request.images.removedImages = $scope.removedImages;
			
			removeImagesFromProperty(request);
			
			request.images.newImages = getNewImages($scope.propertyImages);
			request.isEditProperty = isEditProperty;
			
			updateCoverPhotoUrl(request);
		}
		
		$scope.disableSubmitbtn = true;
		$rootScope.$broadcast('SHOW_PROGRESS_BAR');
		registerPropertyService.registerProperty(angular.toJson(request))
			.success(savePropertySuccessHandler)
			.error(savePropertyErrorHandler);
    };
	
	var removeImagesFromProperty = function(request) {
		if(request.property.urls && request.property.urls.propertyUrls) {
			angular.forEach(request.images.removedImages, function (image, i) {
				request.property.urls.propertyUrls.splice(request.property.urls.propertyUrls.indexOf(image), 1);
			});
		}
	}
	
	var updateCoverPhotoUrl = function(request) {
		if($scope.propertyImages.length == 0 && request.property.urls && request.property.urls.coverPhotoUrl) {
			request.property.urls.coverPhotoUrl=null;
		}
		
		if(request.property.urls && request.property.urls.propertyUrls) {
			angular.forEach($scope.propertyImages, function (image, i) {
				if(image.coverPhoto) {
					request.property.urls.coverPhotoUrl=image;
				} 
			});
		}
	}
	
	var getNewImages = function(propertyImages) {
		var newImages = [];
		angular.forEach(propertyImages, function (image, i) {
			if(image.data) {
				newImages.push(image);
			} 
		});
		return newImages;
	}
	
	
	var savePropertySuccessHandler = function(data){
		var modalInstance = $modal.open({
		  templateUrl: 'modules/registerproperty/html/register-success.html',
		  controller: 'ModalInstanceCtrl',
		  keyboard:false,
		  backdrop:'static',
		  windowClass:'sign-modal'
		});
		modalInstance.result.then(function (result) {
			 $location.path('/properties/' + $scope.property.user.city + '/' + $scope.property.user.locality);
		});
		$rootScope.$broadcast('HIDE_PROGRESS_BAR');
	};
	
	var savePropertyErrorHandler = function(e){
		alert(e);
		$scope.disableSubmitbtn = true;
		$rootScope.$broadcast('HIDE_PROGRESS_BAR');
		
	};
	
	var adjustProperty = function(property) {
		property.active='A';
		if(fatHomeAppStateUtil.isRegisterProperty()) {
			property.createdDate = new Date();
			property.lastUpdatedDate = new Date();
		} else {
			property.lastUpdatedDate = new Date();
		}
	
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

		removeNonQualifiedProperties(property);
		return property;
	}
	
	var removeNonQualifiedProperties = function(property) {
	
		
	
		if(property.details.mode === 'Sell') {
			delete property.details.monthlyRent;
			delete property.details.maintenanceFee;
			delete property.details.deposit;
			delete property.details.allowNonVeg;
			delete property.details.allowPets;
			delete property.details.preferredTenant;
			delete property.details.commitionInDays;
			delete property.details.fixedPrice;
		}

		if(property.details.mode === 'Rent') {
			delete property.details.area.perUnitPrice;
			delete property.details.area.plotOrLand;
			delete property.details.price;
			delete property.details.propertyStatus;
			if(property.specifications && property.specifications.unitsAvailable) {
				delete property.specifications.unitsAvailable;
			}
		}
		
		if(property.details.propertySubType === 'Land/Plot') {
			delete property.details.propertyStatus;
			delete property.details.area.builtUp;
			delete property.details.bedRooms;
			delete property.details.bathRooms;
			delete property.details.monthlyRent;
			delete property.details.maintenanceFee;
			delete property.details.allowNonVeg;
			delete property.details.allowPets;
			delete property.details.preferredTenant;
			delete property.details.commitionInDays;
			delete property.details.fixedPrice;
		}
			
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
	
	$scope.showForm1OrForm2 = function() {
		$scope.showForm3=false;
		if($scope.property.details.propertySubType === 'Land/Plot') {
			$scope.form1.submitted=false;
			$scope.showForm1=true;
		} else {
			$scope.form2.submitted=false;
			$scope.showForm2=true;
		}
	}
	
	$scope.changePropertySubTypeHandler = function() {
		if($scope.property.details.propertySubType === 'Land/Plot') {
			$scope.property.details.mode = 'Sell';
			return;
		}
	
		$scope.property.details.mode= '';
	}
	

}])
.service('RegisterPropertyService',['$http',  'servicesBaseUrl', function($http, servicesBaseUrl) {
    this.registerProperty = function (property) {
        return $http.post(servicesBaseUrl+'/properties/register-property', property);
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
			
			
				var center;
				if(scope.property.location) {
					center = new google.maps.LatLng(scope.property.location.lat, scope.property.location.lng);
				} else {
					center = new google.maps.LatLng(scope.location.lat, scope.location.long);
				}
			
				var mapOptions = {
									zoom: 15,
									center: center,
									mapTypeId: google.maps.MapTypeId.ROADMAP
								};
				var map = new google.maps.Map(el[0], mapOptions);
				
				var marker = new google.maps.Marker({
					position: center,
					map: map,
					animation: google.maps.Animation.BOUNCE,
					draggable:true

				});

				var info = new google.maps.InfoWindow({
					content:"<div style='line-height:1.35;overflow:hidden;white-space:nowrap;height:20px;'>Drag me on to property</div>"
				})

				info.open(map, marker);
				google.maps.event.addListener(marker, 'dragend', function(e)
				{
					updatePropertyLocation(e.latLng.lat(), e.latLng.lng());
					google.maps.event.removeListener(centerChangeListener);
					info.close();
				});
				
				google.maps.event.addListener(map, 'dragend', function(e)
				{
					if(!e) {
						return;
					}
					
					updatePropertyLocation(e.latLng.lat(), e.latLng.lng());
					//google.maps.event.removeListener(centerChangeListener);
				});
				
				var updatePropertyLocation = function(lat, lng) {
					if(!scope.property.location) {
						scope.property.location = {};
					}
					
					scope.property.location.lat= lat;
					scope.property.location.lng= lng;
					
					//google.maps.event.removeListener(centerChangeListener);
				}
				
				var centerChangeListener = google.maps.event.addListener(map, 'center_changed', function(e) {
					if(map.getZoom() < 15) {
						return;
					}
					
					var center = map.getCenter();
					updatePropertyLocation(center.lat(), center.lng());
					marker.setPosition(center);
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