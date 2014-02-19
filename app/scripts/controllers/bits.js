'use strict';

angular.module('lifebitsApp')
    .controller('BitsCtrl', function($scope, $location, $routeParams, Google, Db) {

        var u = Google.getUser();
        if (!u || !u.id) {
            $location.path('/');
            return;
        }

		// display
        if($routeParams.topicId) {
        	$scope.details = searchTopic('/'+$routeParams.topicId);
        }

		// share
        if($routeParams.shareId) {
        	$scope.details = searchTopic('/'+$routeParams.shareId);
        }

        $scope.share = function(content) {
        	Db.share(content);
        }

    });
