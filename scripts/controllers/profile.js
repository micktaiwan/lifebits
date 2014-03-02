'use strict';

angular.module('lifebitsApp')
  .controller('ProfileCtrl', function($scope, $location, $cookies, $filter, Db, Google) {

    var u = Google.getUser();
    if (!u || !u.id) {
      $cookies.redirect = '/profile';
      $location.path('/login');
      return;
    }

    function sortByDate(shares) {
      return shares.sort(function(a, b) {
        return b.creationDate - a.creationDate;
      });
    }

    function getShares() {
      Db.getUserShares(function(shares) {
        $scope.length = shares.length;
        $scope.shares = $filter('partition')(sortByDate(shares), 2);
      });
    }

    $scope.deleteShare = function(id) {
      Db.deleteShare(id);
      getShares();
    };

    getShares();

  });
