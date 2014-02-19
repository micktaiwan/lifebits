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
        	$scope.title = $scope.details.property['/type/object/name'].values[0].value;
			$scope.id = $scope.details.id;
        }

        $scope.share = function(id, title, content) {
        	Db.addShare(id, title, content);
        }

    });
