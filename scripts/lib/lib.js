'use strict';

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
    xmlHttp.open("GET", url + '/topic' + id + '?key=' + freebaseKey, false); // synchrone à cause de false
    xmlHttp.send(null); // TODO: callback
    return eval("(" + xmlHttp.responseText + ")");
}
