'use strict';

angular.module('lifebitsApp')
  .controller('MainCtrl', function($scope, $rootScope, $filter, Db, Freebase) {

    $rootScope.details = null;
    $scope.shares = null;

    function findByObjectId(list, id) {
      for (var i in list) {
        if (list[i].object_id === id) {
          return true;
        }
      }
      return false;
    }

    Db.getShares(null, 0, function(shares) {
      $scope.raw_shares = shares;
      $scope.lastupdates = shares.reduce(function(list, item) {
          if (myfind(list, item.id, 'id') === -1) {
            list.push(item);
          }
          return list;
        }, []).slice(0,50);
    });

    $scope.setShareCategory = function(sid) {
      Freebase.searchTopic(sid, function(result) {
        console.log(result);
        if (!result.property['/common/topic/notable_types']) {
          console.error('no /common/topic/notable_types');
          return;
        }
        Db.setShareCategory(sid, result.property['/common/topic/notable_types'].values[0].text, result.property['/common/topic/notable_types'].values[0].id);
      });

    };

  });
