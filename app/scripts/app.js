'use strict';

angular.module('lifebitsApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'google',
    'lifebitsApp.services.db',
    'lifebitsApp.services.history',
    'lifebitsApp.filters.dateDelta',
])
    .config(function($routeProvider) {
        $routeProvider
            .when('/main', {
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
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .when('/:params', {
                redirectTo: '/login'
                /*
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
                */
            })
            .otherwise({
                redirectTo: '/main'
            });
    });