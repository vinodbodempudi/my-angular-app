'use strict';

angular.module('registerProperty', [])
.controller('RegisterPropertyCtrl',['$scope', 'LocationService', 'FatHomeUtil', 'RegisterPropertyService', 
	function($scope, locationService, fatHomeUtil, registerPropertyService) {
    
    $scope.property = {};
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
	
	
	/*$scope.property.user = {};
	$scope.property.user.emails = [''];
	$scope.addEmail = function(){
    	$scope.property.user.emails.push('');
    }
	
	$scope.removeEmail = function(i){
    	if(i>0) $scope.property.user.emails.splice(i,1);
    }
	*/
	locationService.getCities()
	.success(function(data){
			$scope.cities = data;
		}).error(function(e){
			
		});
	$scope.getLocalities = function(city) {
		locationService.getLocalities(city)
		.success(function(data){
		        $scope.localities = data;
		    }).error(function(e){
		    	
		    });
	}

    $scope.registerProperty = function () {
	
	   $scope.property.createdDate = new Date();
	   console.log(angular.toJson($scope.property));
       registerPropertyService.registerProperty(angular.toJson($scope.property))
       	    .success(function(data){
		    }).error(function(e){
		    });
    };
}])
.service('RegisterPropertyService',['$http',  function($http) {
        // var registerPropertyURL = 'http://localhost:3000/properties';
   	var registerPropertyURL = 'http://54.88.7.125:3000/properties';
    this.registerProperty = function (property) {
        return $http.post(registerPropertyURL, property);
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
