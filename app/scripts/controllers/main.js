'use strict';

angular.module('fatHomesApp')
  .controller('MainCtrl', function ($scope) {
    $scope.propTypes = [
      {name:'Residential', value:'Res'},
      {name:'Commercial', value:'Com'},
      {name:'Land', value:'land'}
    ];


     $scope.beds = [
      {name:'One', value:'1'},
      {name:'Two', value:'2'},
      {name:'Three', value:'3'},
      {name:'Four', value:'4'},
      {name:'Five', value:'5'},
      {name:'Six', value:'6'},
      {name:'Seven', value:'7'},
      {name:'Eight', value:'8'},
      {name:'Nine', value:'9'}

    ];

  });
