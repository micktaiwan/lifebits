'use strict';

angular.module('lifebitsApp').directive('categories', function($filter) {

  var allShares = [];

  function link(scope, element, attrs) {
    scope.$watch('raw_shares', function(shares) {
      if (shares === undefined) return;

      function filterByCategories() {
        if (allShares == []) return;
        if (scope.selection.length == 0) {
          homepageShares();
          return;
        }
        var shares = allShares.reduce(function(list, item) {
          if (myfind(scope.selection, item.notable_type_id, null) !== -1) list.push(item);
          return list;
        }, []);
        //console.log(shares);
        scope.shares = $filter('partition')(shares, 2);
      }

      function homepageShares() {
        // initialize page with last shares with images
        var homepageShares = allShares.filter(function(i) {
          return i.image_id != null;
        });

        homepageShares = homepageShares.reduce(function(list, item) {
          if (myfind(list, item.id, 'id') === -1) {
            if (!item.notable_type_id) item.notable_type_id = null;
            list.push(item);
          }
          return list;
        }, []).slice(0,20);

        scope.shares = $filter('partition')(homepageShares, 2);
      }

      allShares = shares;
      homepageShares();

      scope.selection = []; // selected categories
      // helper method
      scope.selectedCategories = function selectedCategories() {
        return filterFilter(scope.categories, {
          selected: true
        });
      };

      // watch categories for changes
      scope.$watch('categories|filter:{selected:true}', function(nv) {
        if (!nv) return;
        scope.selection = nv.map(function(cat) {
          return cat.id;
        });
        filterByCategories();
      }, true);

      // initialize categories
      var cats = [];
      var index;
      for (var i in shares) {
        if (!shares[i].notable_type) {
          shares[i].notable_type = 'Not defined';
          shares[i].notable_type_id = null;
        }
        if ((index = myfind(cats, shares[i].notable_type_id, 'id')) === -1) {
          cats.push({
            label: shares[i].notable_type,
            id: shares[i].notable_type_id,
            nb: 1
          });
        } else {
          cats[index].nb = cats[index].nb + 1;
        }
      }
      cats = cats.sort(function(a, b) {
        //return b.nb - a.nb;
        if (a.label < b.label)
          return -1;
        if (a.label > b.label)
          return 1;
        return 0;
      });
      scope.categories = cats;
      scope.catGroups = $filter('partition')(cats, 3);
    });

  }

  return {
    templateUrl: 'views/categories.html',
    link: link
  };
});
