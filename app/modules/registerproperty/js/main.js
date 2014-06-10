'use strict';

angular.module('registerProperty', [])
.controller('RegisterPropertyCtrl',['$scope', 'LocationService', 'FatHomeUtil', 'RegisterPropertyService', 
	function($scope, locationService, fatHomeUtil, registerPropertyService) {
    
    $scope.property = {};
	$scope.unitOptions = fatHomeUtil.unitOptions();
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
		locationService.getLocalities()
		.success(function(data){
		        $scope.localities = data;
		    }).error(function(e){
		    	
		    });
	}

    $scope.registerProperty = function () {
	
		alert(angular.toJson($scope.property))
		console.log(angular.toJson($scope.property));
       registerPropertyService.registerProperty(angular.toJson($scope.property))
       	    .success(function(data){
		    }).error(function(e){
		    });
    };
}])
.service('RegisterPropertyService',['$http',  function($http) {
	var registerPropertyURL = 'http://localhost:3000/properties';
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
});
