'use strict';

angular.module('lifebitsApp.services.freebase', []).factory('Freebase', function() { //($rootScope, $location, CONFIG) {

  // TODO:
  // use $.ajax and asynchronous call

  var freebaseKey = 'AIzaSyDFVeNzDuEmGe7eZProsCUwxgthSfFU2Hs';
  var url = 'https://www.googleapis.com/freebase/v1';


  /*
    function doSearchTopics(search) {
      console.log('searchTopics: ' + search);
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open('GET', url + '/search?query=' + search + '&key=' + freebaseKey, false);
      xmlHttp.send(null);
      return eval('(' + xmlHttp.responseText + ')');
    }
*/


  return {

    getFreebaseKey: function() {
      return freebaseKey;
    },

    searchTopic: function(id, callback) {
      console.log('searchTopic: ' + id);
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open('GET', url + '/topic' + id + '?key=' + freebaseKey, false);
      xmlHttp.send(null);
      var result = eval('(' + xmlHttp.responseText + ')');
      if(callback) callback(result);
      return result;
      /*
        $.ajax({ // FIXME: use Angular's $ressource ?
            url: url + '/topic' + id + '?key=' + freebaseKey,
            beforeSend: function (xhr) {
              //xhr.setRequestHeader('Authorization', 'OAuth ' + token);
              xhr.setRequestHeader('Accept',        'application/json');
            },
            success: function (response) {
              callback(response);
            }
        });
      */
    }


  };


});
