'use strict';

angular.module('registerProperty', [])

.controller('RegisterPropertyCtrl',['$scope', 'RegisterPropertyService', function($scope, registerPropertyService) {
    
    $scope.propertyDetails = {};

    $scope.registerProperty = function () {
       registerPropertyService.registerProperty(propertyDetails)
       	    .success(function(data){
		        
		    }).error(function(e){
		    	
		    });
    };


}])
.service('RegisterPropertyService',['$http',  function($http) {
    this.registerProperty = function (propertyDetails) {
        return $http.post('', propertyDetails);
    };

}]);
