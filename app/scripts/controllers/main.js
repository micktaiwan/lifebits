'use strict';

angular.module('lifebitsApp')
  .controller('MainCtrl', function($scope, Db) {

    function toArray(obj) {
      var shares = [];
      for (var topic_id in obj) {
        for (var prop_id in obj[topic_id]) {
            var share = obj[topic_id][prop_id];
            share['topic_id'] = topic_id.replace(/_/g, '/');
            shares.push(share);
        }

      }
      return shares;
    }

    Db.getShares(function(shares) {
      //console.log(shares);
      $scope.shares = toArray(shares);
    });

  });
