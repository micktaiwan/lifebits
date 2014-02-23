'use strict';

angular.module('lifebitsApp')
  .controller('BitsCtrl', function($scope, $rootScope, $location, $routeParams, Google, Db, History) {

    $rootScope.history = History.getItems();

    function sortByDate(shares) {
      return shares.sort(function(a, b) {
        return a.modificationDate - b.modificationDate;
      });
    }

    // display
    if ($routeParams.topicId) {
      $rootScope.searchTopic('/' + $routeParams.topicId);
/*      Db.getShares('/' + $routeParams.topicId, 0, function(shares) {
        $rootScope.topicShares = sortByDate(shares);
      });
*/    }

    // share
    if ($routeParams.shareId) {
      var u = Google.getUser();
      if (!u || !u.id) {
        $location.path('/login');
        return;
      }
      $rootScope.searchTopic('/' + $routeParams.shareId);
      Db.getShareContent($routeParams.shareId, function(val) {
        $scope.content = val;
      });
    }

    $scope.share = function(id, title, content, image_id) {
      Db.addShare(id, title, content, image_id);
      $location.path('/bits/id' + id);
    }
    $scope.deleteShare = function(id) {
      Db.deleteShare(id);
      Db.getShares(id, 0, function(shares) {
        $rootScope.topicShares = sortByDate(shares);
      });
    }

  });
