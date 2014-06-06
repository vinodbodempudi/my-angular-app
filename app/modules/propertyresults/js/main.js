'use strict';

angular.module('propertyResults', [])

.controller('PropertyResultsCtrl',['$scope', '$routeParams', 'PropertyResultsService', function($scope, $routeParams, propertyResultsService) {
    
    var getPropertiesRequest = {city:$routeParams.city, locality:$routeParams.locality};

	propertyResultsService.getProperties(getPropertiesRequest)
		.success(function(data){
			  
		}).error(function(e){
			
		});
	

}]).service('PropertyResultsService',['$http',  function($http) {

    this.getProperties = function (getPropertiesRequest) {
        return $http.post('', getPropertiesRequest);
    };

}]);

