'use strict';

angular.module('fatHomesApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.companyInfo = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

$scope.developers=['Pradeep Jutur',
'Vinod Bodempudi'
,'Shiva'];

$scope.name ='hello world';

  });
