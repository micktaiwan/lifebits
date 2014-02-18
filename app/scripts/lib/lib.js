'use strict';

var key = 'AIzaSyDFVeNzDuEmGe7eZProsCUwxgthSfFU2Hs';
var url = 'https://www.googleapis.com/freebase/v1'

function searchTopics(search) {
	console.log('searchTopics: ' + search);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url + '/search?query=' + search +'&key='+key, false);
    xmlHttp.send(null);
    return eval("(" + xmlHttp.responseText + ")");
}

function searchTopic(id) {
	console.log('searchTopic: ' + id);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url + '/topic' + id +'?key='+key, false);
    xmlHttp.send(null);
    return eval("(" + xmlHttp.responseText + ")");
}

