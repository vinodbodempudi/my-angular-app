'use strict';

angular.module('home', [])

.controller('HomeCtrl',['$scope', 'LocationService', '$location', '$rootScope', function($scope, locationService, $location, $rootScope) {
    
	var cityFromCache = localStorage.getItem("city");
	var localityFromCache = localStorage.getItem("locality");
	if(cityFromCache && localityFromCache) {
		$location.path('/properties/' + cityFromCache + '/' + localityFromCache);
		$rootScope.showTabs.showTabs = true;
		return;
	}
	
	$scope.showProperties = function(city, locality) {
		$scope.form1.submitted=true;
		
		if($scope.form1.$valid) {
			$rootScope.user.city = city;
			$rootScope.user.locality = locality;
			
			$location.path('/properties/' + city + '/' + locality);
			$rootScope.showTabs.showTabs = true;
		}
	}

	locationService.getCities()
		.success(function(data){
			$scope.cities = data;
			$scope.fatHome.cities = data;
		}).error(function(e){
			
		});
	
	
	$scope.getLocalities = function(city) {
	
		if(!city) {
			$scope.localities = [];
			return;
		}
	
		locationService.getLocalities(city)
		.success(function(data){
				$scope.localities = data;
				$scope.fatHome.localities = data;
			}).error(function(e){
				
			});
	}
	$scope.hideHomeScreen = false;
}]).service('HomeService',['$http',  function($http) {

	
}])
.service('FatHomeUtil',function() {

	this.getLocationDetails = function (localities, localityName) {
        for (var i = 0; i <localities.length; i++) { 
			if(localities[i].locality ===  localityName) {
				return localities[i];
			}
		}
		return {};
    };

	this.propertySortOptions = function () {
        return [
			{lable:"Date", dataField:"createdDate", reverseOrder:true},
			{lable:"Price(low to high)", dataField:"price", reverseOrder:false},
			{lable:"Price(high to low)", dataField:"price", reverseOrder:true},
			{lable:"Sqft(low to high)", dataField:"size", reverseOrder:false},
			{lable:"Sqft(high to low)", dataField:"size", reverseOrder:true},
		];
    };
	
	this.unitOptions = function () {
        return [{label:"Sq. Feet", sqftMultiplier:1},
				{label:"Sq. Meter", sqftMultiplier:10.76},
				{label:"Sq. Yards", sqftMultiplier:9},
				{label:"Aankadam", sqftMultiplier:774.91},
				{label:"Acres", sqftMultiplier:43560},
				{label:"Ares", sqftMultiplier:11582.34},
				{label:"Bigha", sqftMultiplier:26910.65},
				{label:"Biswa", sqftMultiplier:1360},
				{label:"Cents", sqftMultiplier:435.60},
				{label:"Guntha", sqftMultiplier:1089},
				{label:"Grounds", sqftMultiplier:2395.80},
				{label:"Hectares", sqftMultiplier:107638},
				{label:"Kanal", sqftMultiplier:5445.21},
				{label:"Kottah", sqftMultiplier:720},
				{label:"Marla", sqftMultiplier:272.25},
				{label:"Perch", sqftMultiplier:2931.11},
				{label:"Rood", sqftMultiplier:117244.35}]
		
    };
	
	this.getSqftMutiplier = function (units) {
		var unitOptions = this.unitOptions(), i;
		for (i = 0; i <unitOptions.length; i++) { 
			if(unitOptions[i].label ===  units) {
				return unitOptions[i].sqftMultiplier;
			}
		}
		
		return 0;
	};
	
	this.getDropDownValues = function (maxValue) {
		var hours = [];
		for (var i = 0; i <= maxValue; i++) { 
			if(i < 10) {
				hours[i] = '0'+i;
				continue;
			}
			hours[i] = ''+i;
		}
        return hours;
    };
	
	this.hoursDropDownValues = function () {
        return this.getDropDownValues(23);
    };
	
	this.noOfUnitsDropDownValues = function () {
		var vales = [];
		for (var i = 1; i <= 30; i++) { 
			if(i < 10) {
				vales[i] = '0'+i;
				continue;
			}
			vales[i] = ''+i;
		}
        return vales;
    };
	
	this.bedRoomsDropDownValues = function () {
        var vales = [];
		for (var i = 0; i <= 9; i++) { 
			vales[i] = ''+i;
		}
        return vales;
    };
	
	this.bathRoomsDropDownValues = function () {
		var vales = [];
		for (var i = 0; i <= 9; i++) { 
			vales[i] = ''+i;
		}
        return vales;
    };
	
	this.flooringDropDownValues = function () {
        return [
			"Marble",
			"Normal Tiles",
			"Vitrified Tiles",
			"Wooden",
			"Ceramic",
			"Mosaic Tiles",
			"Granite",
			"Spartex Tiles",
			"Marbonite",
			"Stone",
			"IPSFinish",
			"Cement",
			"Vinyl",
			"Other"
		];
    };
	
	this.propertyTypes = function () {
		return [
			"Residential"
			//"Commercial"
		];
    };
	
	this.propertySubTypeMapper = function (){
	
		return {
			"Residential": [
				"Apartment",
				"Individual House/Villa",
				//"Residential Land/Plot",
				"Builder Floor",
				"Pent House",
				"Farm House",
				"Service Apartment",
				"Studio Apartment"
			],
			
			"Commercial":[
				"Office space/complex",
				"Office in IT Park/SEZ",
				"Commercial shops/showrooms",
				"Shopping mall Space",
				"Showrooms",
				"Business Center",
				"Commercial land/plots",
				"Warehouse/Godown",
				"Banquet Hall/Guest House",
				"Hotel/Restaurant",
				"Institutional land",
				"Clinic/Hospital Building",
				"Hotel Sites",
				"Industrial Land/Plots",
				"Industrial Building",
				"Industrial Shed",
				"Agricultural Land"
			]
		};
	};
	this.balconiesDropDownValues = function () {
        var vales = [];
		for (var i = 1; i <= 9; i++) { 
			vales[i] = i;
		}
        return vales;
    };
	
	
	this.ageOfPropertyOptions = function () {
		var years = [], months = [];
		for (var i = 0; i <= 30; i++) { 
			if(i < 10) {
				years[i] = '0'+i;
				continue;
			}
			years[i] = i;
		}
		
		for (var i = 0; i <= 11; i++) { 
			if(i < 10) {
				months[i] = '0'+i;
				continue;
			}
			months[i] = i;
		}
        return {
			years:years,
			months:months			
		};
    };
	
	this.convertToCamelCase = function (value) {
        if(!value) {
			return '';
		}
	
        return value.charAt(0).toUpperCase() + value.substr(1).replace(/[A-Z]/g, ' $&');
    };
	
	this.currencyFormater = function(value) {
  
		if(!value) {
			return "";
		}
	  
		var temp=value.toString(), index = temp.indexOf(".");
		if(index > -1) {
			temp = str.substring(0, index);
		}

		var lastThree = temp.substring(temp.length-3);
		var otherNumbers = temp.substring(0,temp.length-3);
		if(otherNumbers != '')
			lastThree = ',' + lastThree;
		return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
	}

});

