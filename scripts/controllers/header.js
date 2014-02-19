'use strict';

angular.module('lifebitsApp')
    .controller('HeaderCtrl', function HeaderController($scope, $location) {
        $scope.isActive = function(viewLocation) {
            return viewLocation === $location.path();
        };
    });
