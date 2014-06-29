'use strict';

angular.module('registerProperty', [])
.controller('RegisterPropertyCtrl',['$scope', 'LocationService', 'FatHomeUtil', '$routeParams', 'RegisterPropertyService',
	function($scope, locationService, fatHomeUtil, $routeParams, registerPropertyService) {
	
	$scope.user.city = $scope.city = $routeParams.city;
	$scope.user.locality = $scope.locality = $routeParams.locality;
	
	$scope.registerPropertySuccess = false;
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
				$scope.currentLocationDetails = fatHomeUtil.getLocationDetails(data, $scope.locality);
			}).error(function(e){
				
			});
	}

	if($scope.fatHome.localities) {
		$scope.currentLocationDetails = fatHomeUtil.getLocationDetails($scope.fatHome.localities, $scope.locality);
	}

	$scope.updatePropertyStatus = function() {
		if($scope.property.details.mode==='Sell') {
			$scope.property.details.propertyStatus='Resale';
		}
	}

	$scope.updateCoverPhotoIndex = function(index) {
	
		angular.forEach($scope.property.photos, function (image, i) {
			if(i===index) {
				image.coverPhoto = true;
			} else {
				image.coverPhoto = false;
			}
		
		});
		
	}
	
	
	
    $scope.registerProperty = function () {
	
	   $scope.property.createdDate = new Date();
	   console.log(angular.toJson($scope.property));
       registerPropertyService.registerProperty(angular.toJson($scope.property))
       	    .success(function(data){
				$scope.registerPropertySuccess = true;
		    }).error(function(e){
		    });
    };
}])
.service('RegisterPropertyService',['$http',  'servicesBaseUrl', function($http, servicesBaseUrl) {
    this.registerProperty = function (property) {
        return $http.post(servicesBaseUrl+'/properties', property);
    };
}])
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

/*
.directive('imageReader',function(){

	var fileToDataURL = function (file) {
		var deferred = $q.defer();
		var reader = new FileReader();
		reader.onload = function (e) {
			deferred.resolve(e.target.result);
		};
		reader.readAsDataURL(file);
		return deferred.promise;
	};

	return {
		restrict : 'A',
		link : function(scope, el, attrs, cntr){
			el.on('change', function (evt) {
			
				var imageResult = {
					file: files[0],
					url: URL.createObjectURL(files[0])
				};

				fileToDataURL(files[0]).then(function (dataURL) {
					imageResult.dataURL = dataURL;
				});
			
				var f = this.value;
				if(this.files){
					rf(this.files[0], this.name,this);
				}else{
					var c = ierf(f);
					set(this.name, c, f);
				}
			};			
			function rf(f,n,e){
				var reader = new FileReader();
				reader.onload = readSuccess;
				function readSuccess(evt){
					set(n, evt.target.result, e.value);
				};
				reader.readAsText(f);
			}
			function ierf(f){
				try{
					var a  = new ActiveXObject("Scripting.FileSystemObject"), o = a.OpenTextFile(f, 1), c = o.ReadAll(); 
					o.Close();
					return c;
				}catch(e){
					return "";
				}
			}
			function set(n, c, f){
				scope[n] = c;
				scope[n+"Label"] = f;
				scope.$apply();
			}					
		}	
	}
});*/
