'use strict';

angular.module('lifebitsApp')
  .controller('BitsCtrl', function($scope, $rootScope, $location, $routeParams, $cookies, Google, Db, History) {

    $rootScope.history = History.getItems();
    $rootScope.details = null;

    function sortByDate(shares) {
      return shares.sort(function(a, b) {
        return a.modificationDate - b.modificationDate;
      });
    }

    // display
    if ($routeParams.topicId) {
      $cookies.redirect = '/bits/id/'+$routeParams.topicId;
      $rootScope.searchTopic('/' + $routeParams.topicId);
    }

    // share
    if ($routeParams.shareId) {
      var u = Google.getUser();
      if (!u || !u.id) {
        $cookies.redirect = '/bits/share/'+$routeParams.shareId;
        $location.path('/login');
        return;
      }
      $rootScope.searchTopic('/' + $routeParams.shareId);
      Db.getShareContent($routeParams.shareId, function(val) {
        $scope.content = val;
      });
    }

    $scope.cancelShare = function(id) {
      $location.path('/bits/id' + id);
    };

    $scope.share = function(id, title, content, image_id, notable_type, notable_type_id) {
      Db.addShare(id, title, content, image_id, notable_type, notable_type_id);
      $location.path('/bits/id' + id);
    };

    $scope.deleteShare = function(id) {
      Db.deleteShare(id);
      Db.getShares(id, 0, function(shares) {
        $rootScope.topicShares = sortByDate(shares);
      });
    };

  });
