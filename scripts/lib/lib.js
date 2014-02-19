'use strict';

// TODO:
// 1. make a service
// 2 use $.ajax and asynchronous call
// 3. profit

var freebaseKey = 'AIzaSyDFVeNzDuEmGe7eZProsCUwxgthSfFU2Hs';
var url = 'https://www.googleapis.com/freebase/v1';

function searchTopics(search) {
    console.log('searchTopics: ' + search);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url + '/search?query=' + search + '&key=' + freebaseKey, false);
    xmlHttp.send(null);
    return eval("(" + xmlHttp.responseText + ")");
}

function searchTopic(id) {
    console.log('searchTopic: ' + id);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url + '/topic' + id + '?key=' + freebaseKey, false);
    xmlHttp.send(null);
    return eval("(" + xmlHttp.responseText + ")");
    /*
        $.ajax({ // FIXME: use Angular's $ressource ?
            url: url + '/topic' + id + '?key=' + freebaseKey,
            beforeSend: function (xhr) {
              //xhr.setRequestHeader('Authorization', "OAuth " + token);
              xhr.setRequestHeader('Accept',        "application/json");
            },
            success: function (response) {
              callback(response);
            }
        });
*/
}
