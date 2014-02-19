'use strict';

angular.module('lifebitsApp')
    .controller('MainCtrl', function($scope, $rootScope, $timeout, Google, Db, History) {

        var timeLimit = 0.75 * 1000;
        var promise = null;
        $scope.history = History.getItems();

        Google.login(
            function() { // success callback
                $rootScope.$apply(function() {
                    var u = Google.getUser();
                    //console.log(u);
                    $rootScope.user = u;
                    $scope.user = u;
                    Db.setUser(u);
                });
            },
            function() { // failure callback
                console.log('error in Google login')
            });

        $scope.user = Google.getUser();

        function doSearch(id) {
            $scope.details = searchTopic(id);
            History.add(id, $scope.details.property['/type/object/name'].values[0].text);
            $scope.history = History.getItems();
        }

        $scope.searchTopic = function(id) {
            doSearch(id);
            console.log($scope.details.id);
        };


        $scope.bookmark = function(id) {
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
            $scope.$apply(function() {
                doSearch(data.id);
            });
        });

    });
