'use strict';

angular.module('lifebitsApp')
  .controller('MainCtrl', function($scope, $rootScope, Db) {

    function sortByDate(shares) {

        return shares.sort(function(a,b) {
            return b.modificationDate - a.modificationDate;
        });
    }

    Db.getShares(null, function(shares) {
      //console.log(shares);
      $scope.shares = sortByDate(shares);
    });

    $rootScope.details = null;

  });
