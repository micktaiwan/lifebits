'use strict';

angular.module('lifebitsApp')
  .controller('SearchCtrl', function($scope, $rootScope, Google, Db, History) {

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
        console.log('error in Google login')
      });

    $rootScope.user = Google.getUser();

    function doSearch(id) {
      $rootScope.details = searchTopic(id);
      $rootScope.title = $rootScope.details.property['/type/object/name'].values[0].value;
      $rootScope.id = id;
      History.add(id, $rootScope.title);
      $rootScope.history = History.getItems();
    }

    $rootScope.searchTopic = function(id) {
      console.log(id);
      doSearch(id);
    };

    $rootScope.bookmark = function(id) {
      var u = Google.getUser();
      if (!u || !u.id) {
        $location.path('/bits/bookmark' + id);
        return;
      }
      console.log('bookmarking ' + id);
    };

    $("#myinput").suggest({
      //filter: '(all type:/film/director)'
      "key": freebaseKey
    }).bind("fb-select", function(e, data) {
      console.log(data);
      $rootScope.$apply(function() {
        doSearch(data.id);
      });
    });

  });
