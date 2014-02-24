'use strict';

angular.module('lifebitsApp')
  .controller('MainCtrl', function($scope, $rootScope, $filter, Db) {

    /*   function sortByDate(shares) {

        return shares.sort(function(a,b) {
            return b.modificationDate - a.modificationDate;
        });
    }
*/
    $rootScope.details = null;
    $scope.shares = null;

    function findByObjectId(list, id) {
      for (var i in list) {
        if (list[i].object_id == id)
          return true;
      }
      return false;
    };

    function findById(list, id) {
      for (var i in list) {
        if (list[i].id == id)
          return true;
      }
      return false;
    };

    function parseLU(lu) {
      var rv = [];
      lu = lu.sort(function(a, b) {
        return b.date - a.date;
      });

      for (var i in lu) {
        if (lu[i].ref == "shares" && lu[i].action == "add" && !findByObjectId(rv, lu[i].object_id)) {
          lu[i]['link'] = lu[i]['object_id'].replace(/\*/g, '/');
          rv.push(lu[i]);
        }
      }
      return rv;
    }

    Db.getShares(null, 15, function(shares) {
      //console.log(shares);
      shares = shares.filter(function(i) {
        return i.image_id != null;
      });
      shares = shares.reduce(function(p, c) {
        if (!findById(p, c.id)) p.push(c);
        return p;
      }, []);
      $scope.shares = $filter('partition')(shares, 2);
    });

    Db.getLastUpdates(function(lu) {
      //console.log(lu);
      $scope.lastupdates = parseLU(lu);
    });


  });
