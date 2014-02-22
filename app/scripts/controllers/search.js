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


    // TODO:
    // 1. make a service
    // 2 use $.ajax and asynchronous call
    // 3. profit

    var freebaseKey = 'AIzaSyDFVeNzDuEmGe7eZProsCUwxgthSfFU2Hs';
    var url = 'https://www.googleapis.com/freebase/v1';

    function doSearchTopics(search) {
      console.log('searchTopics: ' + search);
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", url + '/search?query=' + search + '&key=' + freebaseKey, false);
      xmlHttp.send(null);
      return eval("(" + xmlHttp.responseText + ")");
    }

    function doSearchTopic(id) {
      console.log('searchTopic: ' + id);
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", url + '/topic' + id + '?key=' + freebaseKey, false);
      xmlHttp.send(null);
      return eval("(" + xmlHttp.responseText + ")");
      /*
        $.ajax({ // FIXME: use Angular's $ressource ?
            url: url + '/topic' + id + '?key=' + freebaseKey,
            beforeSend: function (xhr) {
              //xhr.setRequestHeader('Authorization', "OAuth " + token);
              xhr.setRequestHeader('Accept',        "application/json");
            },
            success: function (response) {
              callback(response);
            }
        });
*/
    }

    function doSearch(id) {
      $rootScope.details = doSearchTopic(id);
      Db.getShares(id, function(shares) {
        $rootScope.shares = shares;
      });
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
        doSearch(data.mid);
      });
    });

  });
