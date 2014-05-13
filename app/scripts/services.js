'use strict';

angular.module('fatHomesApp')
.factory('PropertyService', function($resource) {
  return $resource('http://localhost:3000/properties');
})
.factory('UserService', function($resource){
	return $resource('http://localhost:3000/users/:id', {}, {
      get: {method:'GET', params:{id:'id'}, isArray: false},
      post: {method:'POST', isArray: false},
      update: {method:'PUT'},
      remove: {method:'DELETE'}
    });
});
