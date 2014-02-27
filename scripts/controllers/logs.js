'use strict';

angular.module('lifebitsApp')
  .controller('LogsCtrl', function($scope, $rootScope, $filter, Db, Freebase) {

    var allLogs = [];
    var limit = 0;
    $scope.limit = limit;


    function doFilter() {
      if (allLogs == []) return;
      var logs = allLogs.reduce(function(list, item) {
        if (item.nb > limit) list.push(item);
        return list;
      }, []);
      $scope.logs = logs;
    }

    $scope.filter = function() {
      limit = limit + 1;
      $scope.limit = limit;
      doFilter();
    };

    Db.getLogs(null, 0, function(logs) {
      allLogs = logs;
      $scope.logs = logs;
    });

  });
