'use strict';

angular.module('lifebitsApp.services.feed', []).factory('Feed',
  function($http, $rootScope) {

    function safeApply(scope, fn) {
      (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    }

    var googleNewsUrl = 'https://news.google.com/news/feeds?output=rss&q=';

    function parseFeed(url) {
      return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
    }

    return {

      loadFeed: function(search, callback) {
        console.log('loading feed for ' + search);
        parseFeed(googleNewsUrl + search).then(function(res) {
          safeApply($rootScope, function() {
            if (!res.data.responseData) {
              callback([]);
            } else {
              callback(res.data.responseData.feed.entries);
            }
          });
        });
      }

    }

  });
