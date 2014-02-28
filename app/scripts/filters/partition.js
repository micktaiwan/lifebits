'use strict';

angular.module('lifebitsApp.filters.partition', []).filter('partition', function() {
    return function(items, nb) {
        if (items) {
            var finalItems = [],
                thisGroup;
            for (var i = 0; i < items.length; i++) {
                if (!thisGroup) {
                    thisGroup = [];
                }
                thisGroup.push(items[i]);
                if (((i+1) % nb) === 0) {
                    finalItems.push(thisGroup);
                    thisGroup = null;
                }
            }
            if (thisGroup) {
                finalItems.push(thisGroup);
            }
            return finalItems;
        }
    };
});
