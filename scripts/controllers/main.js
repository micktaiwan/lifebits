'use strict';

angular.module('lifemomentsApp')
    .controller('MainCtrl', function($scope, $timeout) {

        var timeLimit = 0.75 * 1000;
        var promise = null;

        function searchChanged() {
            if (promise)
                $timeout.cancel(promise);
            promise = $timeout(doSearch, timeLimit);
        }

        function doSearch() {
            if ($scope.search === undefined || $scope.search=='') {
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

    });
