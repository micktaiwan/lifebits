'use strict';

angular.module('lifebitsApp')
    .controller('MainCtrl', function($scope, $timeout, Google) {

        var timeLimit = 0.75 * 1000;
        var promise = null;

        $scope.user = Google.getUser();

        function searchChanged() {
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

        $scope.bookmark = function(id) {
            var u = Google.getUser();
            if (!u || !u.id) {
                $location.path('/bits/bookmark' + id);
                return;
            }
            console.log('bookmarking ' + id);

        };
    });
