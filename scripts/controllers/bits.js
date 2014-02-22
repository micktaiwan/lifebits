'use strict';

angular.module('lifebitsApp')
  .controller('BitsCtrl', function($scope, $rootScope, $location, $routeParams, Google, Db, History) {

    $rootScope.history = History.getItems();

    // display
    if ($routeParams.topicId) {
      $rootScope.searchTopic('/' + $routeParams.topicId);
      Db.getShares('/'+$routeParams.topicId, function(shares){
        $rootScope.shares = shares;
      });
    }

    // share
    if ($routeParams.shareId) {
      var u = Google.getUser();
      if (!u || !u.id) {
        $location.path('/login');
        return;
      }
      $rootScope.searchTopic('/' + $routeParams.shareId);
    }

    $scope.share = function(id, title, content, image_id) {
      Db.addShare(id, title, content, image_id);
      $location.path('/bits/id'+id);
    }

  });
