'use strict';

angular.module('lifebitsApp')
    .controller('MainCtrl', function($scope, $timeout, Google) {

        var timeLimit = 0.75 * 1000;
        var promise = null;


        Google.login(function() {
            $rootScope.$apply(function() {
                var u = Google.getUser();
                //console.log(u);
                $rootScope.user = u;
                Db.setUser(u);
                $location.path('/main');
            });
        });

        $scope.user = Google.getUser();

/*        function searchChanged() {
            if (promise)
                $timeout.cancel(promise);
            promise = $timeout(doSearch, timeLimit);
        }

        function doSearch() {
            if ($scope.search === undefined || $scope.search == '') {
                $scope.searchResults = null;
                $scope.details = null;
                return;
            }
            $scope.searchResults = searchTopics($scope.search);
            $scope.details = null;
        }

        $scope.$watch('search', searchChanged);

        $scope.searchTopic = function(id) {
            $scope.details = searchTopic(id);
            console.log($scope.details.id);
        };
*/

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
                $scope.details = searchTopic(data.id);
            });
        });

    });
