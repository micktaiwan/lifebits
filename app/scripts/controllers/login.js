'use strict';

angular.module('lifebitsApp')
  .controller('LoginCtrl', function($rootScope, $scope, $location, $cookies, Google, Db) {

    Google.login(
      function() { // success callback
        $rootScope.$apply(function() {
          $scope.loading = true;
          var u = Google.getUser();
          //console.log(u);
          $rootScope.user = u;
          Db.setUser(u);
          if ($cookies.redirect) {
            var path = $cookies.redirect;
            $cookies.redirect = null;
            $location.path(path);
            return;
          }
          $location.path('/main');
        });
      },
      function() { // failure callback
        $rootScope.$apply(function() {
          console.log('error in Google login');
        });
      });

    $rootScope.user = Google.getUser();

    $rootScope.logout = function() {
      Google.logout();
      $rootScope.user = null;
      $location.path('/main');
      return;
    };

    $scope.loading = false;
  });
