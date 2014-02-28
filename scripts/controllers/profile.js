'use strict';

angular.module('lifebitsApp')
  .controller('ProfileCtrl', function($scope, $location, $cookies, $filter, Db, Google) {

    var u = Google.getUser();
    if (!u || !u.id) {
      $cookies.redirect = '/profile';
      $location.path('/login');
      return;
    }

    function getShares() {
      Db.getUserShares(function(shares) {
        $scope.length = shares.length;
        $scope.shares = $filter('partition')(shares, 2);
      });
    }

    $scope.deleteShare = function(id) {
      Db.deleteShare(id);
      getShares();
    };

    getShares();

  });
