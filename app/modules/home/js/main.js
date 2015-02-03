'use strict';

angular.module('home', [])

.controller('HomeCtrl',['$scope', 'LocationService', '$location', '$rootScope', 'HomeService', function($scope, locationService, $location, $rootScope, homeService) {
    
	$scope.backgroundImages = ["images/a1.jpg", "images/a2.jpg", "images/a3.jpg"];
	$scope.showProperties = function(city, locality) {
		$scope.form1.submitted=true;
		
		if($scope.form1.$valid) {
			$rootScope.user.city = city;
			$rootScope.user.locality = locality;
			
			$location.path('/properties/' + city + '/' + locality);
			$rootScope.showTabs.showTabs = true;
		}
	}
	
	var getPropertiesCounts = function (city) {
		homeService.getPropertiesCounts(city)
			.success(function(data){
				$scope.propertiesCounts = data;
			}).error(function(e){
				
			});
	
	}

	locationService.getCities()
		.success(function(data){
			$scope.cities = data;
			$scope.fatHome.cities = data;
			$scope.city = data[0];
			getPropertiesCounts($scope.city);
			$scope.getLocalities($scope.city);
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
	
}]).service('HomeService',['$http', 'servicesBaseUrl', function($http, servicesBaseUrl) {
	
	this.getPropertiesCounts = function (city) {
		return $http.get(servicesBaseUrl+'/properties/properties-counts/'+city, {cache:false});
	};
	
}])
.service('FatHomeUtil', ['$rootScope', function($rootScope) {

	this.getAddsImages = function () {
        return [
			{imageUrl:"images/add1.jpg", action:function(){ window.open("https://www.facebook.com/pages/fathomein/327105184080870", "_blank"); }},
			{imageUrl:"images/add2.jpg", action:function(){  }},
			{imageUrl:"images/add3.jpg", action:function(){  }},
			{imageUrl:"images/add4.jpg", action:function(){  }},
			{imageUrl:"images/add5.jpg", action:function(){  }},
			{imageUrl:"images/add6.jpg", action:function(){  }},
			{imageUrl:"images/add7.jpg", action:function(){  }},
			{imageUrl:"images/add8.jpg", action:function(){  }},
			{imageUrl:"images/add9.jpg", action:function(){ $rootScope.$broadcast('showFeedbackForm'); }}
		];
    };

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
			{lable:"Sqft(high to low)", dataField:"size", reverseOrder:true}
		];
    };
	
	this.unitOptions = function () {
        return [{label:"Sq. Feet", sqftMultiplier:1},
				{label:"Sq. Meter", sqftMultiplier:10.7639},
				{label:"Sq. Yards", sqftMultiplier:9},
				{label:"Aankadam", sqftMultiplier:72},
				{label:"Acres", sqftMultiplier:43560},
				{label:"Ares", sqftMultiplier:1076},
				{label:"Bigha I", sqftMultiplier:17424},
				{label:"Bigha II", sqftMultiplier:27225},
				{label:"Biswa I", sqftMultiplier:348480},
				{label:"Biswa II", sqftMultiplier:544500},
				{label:"Cents", sqftMultiplier:435.54},
				{label:"Chataks", sqftMultiplier:450},
				{label:"Guntha", sqftMultiplier:1089},
				{label:"Grounds", sqftMultiplier:2400},
				{label:"Hectares", sqftMultiplier:107639},
				{label:"Kanal", sqftMultiplier:108000},
				{label:"Kottah (B)", sqftMultiplier:720},
				{label:"Marla", sqftMultiplier:5400},
				{label:"Perch", sqftMultiplier:272},
				{label:"Rood", sqftMultiplier:10890}]
		
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
			"Cement",
			"Ceramic",
			"Granite",
			"IPSFinish",
			"Marble",
			"Marbonite",
			"Mosaic Tiles",
			"Normal Tiles",
			"Spartex Tiles",
			"Stone",
			"Vinyl",
			"Vitrified Tiles",
			"Wooden",
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
				"Builder Floor",
				"Farm House",
				"Individual House/Villa",
				"Pent House",
				"Land/Plot",
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
	
        return value.charAt(0).toUpperCase() + value.substring(1);
    };
	
	this.currencyFormater = function(value) {
  
		if(!value) {
			return "";
		}
		
		if(/,/g.test(value)) {
			return value;
		}
	  
		var temp=value.toString(), index = temp.indexOf(".");
		var digitsAfterDecimal;
		if(index > -1) {
			temp = value.substring(0, index);
			digitsAfterDecimal = value.substring(index);
		}

		var lastThree = temp.substring(temp.length-3);
		var otherNumbers = temp.substring(0,temp.length-3);
		if(otherNumbers != '') {
			lastThree = ',' + lastThree;
		}
		
		if(digitsAfterDecimal) {
			lastThree += digitsAfterDecimal;
		}
		
		return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
	}
}])
.service('FatHomeAppStateUtil', ['$location', function($location) {

	this.isRegisterProperty = function () {
        if($location.path().match('registerproperty') != null) {
			return true;
		}
		return false;
    };
	
	this.isEditProperty = function () {
        if($location.path().match('editproperty') != null) {
			return true;
		}
		return false;
    };
	
	this.isPropertiesHome = function () {
        if($location.path().match('properties') != null) {
			return true;
		}
		return false;
    };
	
	this.showRegisterProperty = function () {
        if($location.path().match('properties') != null) {
			return true;
		}
		return false;
    };
	
	this.showPropertiesHome = function (city, locality, propertyId, reload) {
		if(propertyId) {
			$location.path('/properties/' + city + '/' + locality + '/' + propertyId, reload);
			return;
		}
        $location.path('/properties/' + $rootScope.user.city + '/' + $rootScope.user.locality, reload);
    };
	
	this.showEditProperty = function (city, locality, propertyId, reload) {
        $location.path('/editproperty/' + city + '/' + locality + '/' + propertyId, reload);
    };
	
}]);

