'use strict';

angular.module('lifebitsApp')
  .controller('MainCtrl', function($scope, $rootScope, $filter, Db) {

    function sortByDate(shares) {

        return shares.sort(function(a,b) {
            return b.modificationDate - a.modificationDate;
        });
    }

    Db.getShares(null, 0, function(shares) {
      //console.log(shares);
      $scope.shares = $filter('partition')(shares, 2);
    });

    $rootScope.details = null;

  });
