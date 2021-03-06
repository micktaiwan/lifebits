'use strict';

angular.module('lifebitsApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'google',
  'lifebitsApp.services.db',
  'lifebitsApp.services.history',
  'lifebitsApp.services.feed',
  'lifebitsApp.services.freebase',
  'lifebitsApp.filters.dateDelta',
  'lifebitsApp.filters.partition',
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
      .when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/logs', {
        templateUrl: 'views/logs.html',
        controller: 'LogsCtrl'
      })
      .when('/:params', {
        redirectTo: '/login'
      })
      .otherwise({
        redirectTo: '/main'
      });
  });

function myfind(list, value, property) {
  for (var i in list) {
    if (property) {
      //if (!list[i][property]) throw list[i] + ' has no property ' + property;
      if (list[i][property] === value) return i;
    } else {
      if (list[i] === value) return i;
    }
  }
  return -1;
}
