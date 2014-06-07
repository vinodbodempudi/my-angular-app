'use strict';

angular.module('propertyDetails', [])

.controller('PropertyDetailsCtrl',['$scope', '$routeParams', 'PropertyDetailsService', function($scope, $routeParams, propertyDetailsService) {
    
    propertyDetailsService.getPropertyDetails({'id':$routeParams.propertyId})
		.success(function(data){
			$scope.propertyDetails = data;
		}).error(function(e){
			
		});


}]).service('PropertyDetailsService',['$http',  function($http) {

    this.getPropertyDetails = function (request) {
        return $http.get('data/propertydetails.json', request);
    };

}]);

