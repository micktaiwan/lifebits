'use strict';

angular.module('lifebitsApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'google'
])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/bits/id/:topicId*', {
                templateUrl: 'views/bits.html',
                controller: 'BitsCtrl'
            })
            .when('/bits/share/:shareId*', {
                templateUrl: 'views/share.html',
                controller: 'BitsCtrl'
            })
            .when('/bits', {
                templateUrl: 'views/bits.html',
                controller: 'BitsCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
