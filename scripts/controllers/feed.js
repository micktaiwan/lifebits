'use strict';

angular.module('lifebitsApp').controller("FeedCtrl", ['$scope', '$rootScope', 'Feed',
  function($scope, $rootScope, Feed) {

/*    $rootScope.loadFeed = function(url) {
      Feed.parseFeed(url).then(function(res) {
        console.log('news for ' + $rootScope.title);
        $scope.feeds = res.data.responseData.feed.entries;
      });
    }
*/
/*    Feed.loadFeed('https://news.google.com/news/feeds?q=' + $rootScope.title + '&output=rss', function(data) {
      $scope.feeds = data;
    });
*/
  }
]);
