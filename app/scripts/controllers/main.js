'use strict';

angular.module('lifebitsApp')
  .controller('MainCtrl', function($scope, $rootScope, Db) {

    Db.getShares(null, function(shares) {
      //console.log(shares);
      $scope.shares = shares;
    });

    $rootScope.details = null;

  });
