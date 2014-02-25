'use strict';

angular.module('lifebitsApp')
  .controller('SearchCtrl', function($scope, $rootScope, $location, Google, Db, History, Feed, Freebase) {

    $rootScope.history = History.getItems();

    Google.login(
      function() { // success callback
        $rootScope.$apply(function() {
          var u = Google.getUser();
          //console.log(u);
          $rootScope.user = u;
          Db.setUser(u);
        });
      },
      function() { // failure callback
        console.log('error in Google login');
      });

    $rootScope.user = Google.getUser();

    function doSearch(id) {
      Freebase.searchTopic(id, function(result) {
        $rootScope.details = result;
        $rootScope.title = result.property['/type/object/name'].values[0].value;
        $rootScope.id = id;
        Db.logSearch($rootScope.title, id);
        History.add(id, $rootScope.title);
        $rootScope.history = History.getItems();
        Feed.loadFeed($rootScope.title, function(data) {
          $scope.feeds = data;
        });
      });

      Db.getShares(id, 0, function(shares) {
        $rootScope.topicShares = shares;
      });

    }

    $rootScope.searchTopic = function(id) {
      console.log(id);
      doSearch(id);
    };
/*
    $rootScope.bookmark = function(id) {
      var u = Google.getUser();
      if (!u || !u.id) {
        $location.path('/bits/bookmark' + id);
        return;
      }
      console.log('bookmarking ' + id);
    };
*/
    $('#myinput').suggest({
      //filter: '(all type:/film/director)'
      'key': Freebase.getFreebaseKey()
    }).bind('fb-select', function(e, data) {
      console.log(data);
      $rootScope.$apply(function() {
        doSearch(data.mid);
      });
    });

  });
