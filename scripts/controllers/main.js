'use strict';

angular.module('lifebitsApp')
  .controller('MainCtrl', function($scope, $rootScope, $filter, Db, Freebase) {

    /*   function sortByDate(shares) {

        return shares.sort(function(a,b) {
            return b.modificationDate - a.modificationDate;
        });
    }
*/
    $rootScope.details = null;
    $scope.shares = null;
    var allShares = [];
    // selected categories
    $scope.selection = [];
    // helper method
    $scope.selectedCategories = function selectedCategories() {
      return filterFilter($scope.categories, {
        selected: true
      });
    };

    // watch categories for changes
    $scope.$watch('categories|filter:{selected:true}', function(nv) {
      if (!nv) return;
      $scope.selection = nv.map(function(cat) {
        return cat.id;
      });
      filterByCategories();
    }, true);

    function filterByCategories() {
      if (allShares == []) return;
      if ($scope.selection.length == 0) {
        homepageShares();
        return;
      }
      var shares = allShares.reduce(function(list, item) {
        if (find($scope.selection, item.notable_type_id, null) !== -1) list.push(item);
        return list;
      }, []);
      //console.log(shares);
      $scope.shares = $filter('partition')(shares, 2);
    }

    function findByObjectId(list, id) {
      for (var i in list) {
        if (list[i].object_id === id) {
          return true;
        }
      }
      return false;
    }

    function find(list, value, property) {
      for (var i in list) {
        if (property) {
          //if (!list[i][property]) throw list[i] + ' has no property ' + property;
          if (list[i][property] === value) return i;
        } else {
          if (list[i] === value) return i;
        }
      }
      return -1;
    }

    function parseLU(lu) {
      var rv = [];
      lu = lu.sort(function(a, b) {
        return b.date - a.date;
      });

      for (var i in lu) {
        if (lu[i].ref === 'shares' && lu[i].action === 'add' && !findByObjectId(rv, lu[i].object_id)) {
          lu[i].link = lu[i].object_id.replace(/\*/g, '/');
          rv.push(lu[i]);
        }
      }
      return rv;
    }

    function homepageShares() {
      // initialize page with last 15 shares at max with images
      var homepageShares = allShares.filter(function(i) {
        return i.image_id != null;
      });

      homepageShares = homepageShares.reduce(function(list, item) {
        if (find(list, item.id, 'id') === -1) {
          if (!item.notable_type_id) item.notable_type_id = null;
          list.push(item);
        }
        return list;
      }, []);

      $scope.shares = $filter('partition')(homepageShares, 2);
    }

    Db.getShares(null, 0, function(shares) {
      allShares = shares;

      // initialize categories
      var cats = [];
      var index;
      for (var i in allShares) {
        if (!allShares[i].notable_type) {
          allShares[i].notable_type = 'Not defined';
          allShares[i].notable_type_id = null;
          //console.log(allShares[i]);
        }
        if ((index = find(cats, allShares[i].notable_type_id, 'id')) === -1) {
          cats.push({
            label: allShares[i].notable_type,
            id: allShares[i].notable_type_id,
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
      $scope.categories = cats;
      $scope.catGroups = $filter('partition')(cats, 3);
      // will then trigger the watch on categories and then display homepageShares()
    });

    Db.getLastUpdates(function(lu) {
      //console.log(lu);
      $scope.lastupdates = parseLU(lu);
    });

    $scope.setShareCategory = function(sid) {
      Freebase.searchTopic(sid, function(result) {
        console.log(result);
        if (!result.property['/common/topic/notable_types']) {
          console.error('no /common/topic/notable_types');
          return;
        }
        Db.setShareCategory(sid, result.property['/common/topic/notable_types'].values[0].text, result.property['/common/topic/notable_types'].values[0].id);
      });

    };


  });
