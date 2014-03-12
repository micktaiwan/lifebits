'use strict';

angular.module('lifebitsApp').directive('categories', function($filter) {

  var allShares = [];

  function link(scope, element, attrs) {

    function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function flattenCats(cats) {
      var rv = [];
      cats.forEach(function(c) {
        c.subCats.forEach(function(sc) {
          // selected all children if root is selected
          if (c.selected != c.old_selection) {
            sc.selected = c.selected;
          }
          if (sc.selected) rv.push(sc.id);
        });
        if (c.selected != c.old_selection) {
          c.old_selection = c.selected;
        }
      });
      return rv;
    }

    function sanitizeCat(str) {
      str = capitalize(str);
      str = str.replace('_', ' ');
      return str;
    }

    function regroupRootCats(cat) {
      if (cat.label == 'Comic books') {
        cat.label = 'Book';
        cat.id = 'book';
      } else if (cat.label == 'Celebrities') {
        cat.label = 'Person';
        cat.id = 'person';
      } else if (cat.label == 'Location') {
        cat.label = 'Geography';
        cat.id = 'geography';
      } else if (cat.label == 'Cvg') {
        cat.label = "Computer";
        cat.id = 'computer';
      }
      return cat;
    }

    function getRootCat(cat) {
      var label, id;
      if (cat) {
        label = sanitizeCat(cat.split('/')[1]);
        id = cat.split('/')[1];
      } else {
        label = 'Not defined';
        id = ''
      }
      return regroupRootCats({
        label: label,
        id: id
      });
    }

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
      }, []).slice(0, 20);

      scope.shares = $filter('partition')(homepageShares, 2);
    }

    // each time the main scope variable raw_shares is updated, we define categories
    scope.$watch('raw_shares', function(shares) {
      if (shares === undefined) return;

      allShares = shares;
      homepageShares();

      scope.selection = []; // selected categories
      // helper method
      scope.selectedCategories = function selectedCategories() {
        return filterFilter(scope.categories, {
          selected: true
        });
      };

      // initialize categories
      var rootCats = [];
      var cats = [];
      var index, sindex;
      for (var i in shares) {
        if (!shares[i].notable_type) {
          shares[i].notable_type = 'Not defined';
          shares[i].notable_type_id = null;
        }
        var rootCat = getRootCat(shares[i].notable_type_id);
        if ((index = myfind(rootCats, rootCat.id, 'id')) === -1) {
          rootCats.push({
            label: rootCat.label,
            id: rootCat.id,
            nb: 1,
            subCats: [{
              label: shares[i].notable_type,
              id: shares[i].notable_type_id,
              nb: 1
            }]
          });
        } else {
          rootCats[index].nb = rootCats[index].nb + 1;
          if ((sindex = myfind(rootCats[index].subCats, shares[i].notable_type_id, 'id')) === -1) {
            rootCats[index].subCats.push({
              label: shares[i].notable_type,
              id: shares[i].notable_type_id,
              nb: 1
            })
          } else {
            rootCats[index].subCats[sindex].nb = rootCats[index].subCats[sindex].nb + 1;
          }
        }
        // do it again for flat cats
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

      rootCats = rootCats.sort(function(a, b) {
        if (a.label < b.label)
          return -1;
        if (a.label > b.label)
          return 1;
        return 0;
      });

      scope.categories = cats;
      scope.rootCats = rootCats;
    }); // end of watch raw_shares

    // watch categories for selection
    scope.$watch('rootCats', function(nv) {
      if (!nv) return;
      scope.selection = flattenCats(nv);
      filterByCategories();
    }, true);

  } // link function

  return {
    templateUrl: 'views/categories.html',
    link: link
  };
});
