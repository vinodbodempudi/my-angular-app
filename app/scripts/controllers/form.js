'use strict';

angular.module('fatHomesApp')
  .controller('FormCtrl', function ($scope, PropertyService) {

   $scope.save = function(seller){
  	PropertyService.query(function(properties){
    $scope.user = properties;
  });
  }	
  });
