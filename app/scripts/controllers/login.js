'use strict';

angular.module('lifebitsApp')
  .controller('LoginCtrl', function($rootScope, $location, Google, Db) {

    Google.login(
      function() { // success callback
        $rootScope.$apply(function() {
          var u = Google.getUser();
          //console.log(u);
          $rootScope.user = u;
          Db.setUser(u);
        $location.path('/main');
        });
      },
      function() { // failure callback
        console.log('error in Google login');
      });

    $rootScope.user = Google.getUser();


    $rootScope.logout = function() {
      Google.logout();
      $rootScope.user = null;
      $location.path('/main');
      return;
    };

  });
