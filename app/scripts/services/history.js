'use strict';

angular.module('lifebitsApp.services.history', []).factory('History', function() {

    var items = [];
    // TODO: save in DB

    function removeItem(id) {
        for (var i = items.length - 1; i >= 0; i--) {
            if (items[i].id === id) {
                items.splice(i, 1);
                return;
            }
        }
    }

    return {

        add: function(id, text) {
            removeItem(id);
            items.push({
                id: id,
                text: text
            });
        },

        getItems: function() {
            return items;
        }

    };

});
