'use strict';

angular.module('home', [])

.controller('HomeCtrl',['$scope', 'LocationService', function($scope, locationService) {
    
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
	
	
    


}]).service('HomeService',['$http',  function($http) {

	
}])
.service('FatHomeUtil',function() {

	this.propertySortOptions = function () {
        return [
			{lable:"Date", dataField:"date", reverseOrder:false},
			{lable:"Price(low to high)", dataField:"price", reverseOrder:false},
			{lable:"Price(high to low)", dataField:"price", reverseOrder:true},
			{lable:"Sqft(low to high)", dataField:"size", reverseOrder:false},
			{lable:"Sqft(high to low)", dataField:"size", reverseOrder:true},
		];
    };
	
	this.unitOptions = function () {
        return ["Sq. Feet", "Sq. Meter", "Sq. Yards", "Aankadam", "Acres", "Ares",
				"Bigha", "Biswa", "Chataks", "Cents", "Chataks", "Guntha",
				"Grounds", "Hectares", "Kanal", "Kottah", "Marla", "Perch", "Rood"];
		
    };

});

