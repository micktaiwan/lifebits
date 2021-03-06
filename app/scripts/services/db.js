'use strict';

angular.module('lifebitsApp.services.db', []).factory('Db', function($rootScope, $location, CONFIG) {

  var user;

  //var shares = [];
  var shares_ref = new Firebase(CONFIG.firebaseUrl + '/shares');
  var users_ref = new Firebase(CONFIG.firebaseUrl + '/users');
  var lastupdates_ref = new Firebase(CONFIG.firebaseUrl + '/lastupdates');
  var logs_ref = new Firebase(CONFIG.firebaseUrl + '/searchlog');

  function safeApply(scope, fn) {
    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
  }

  function toArray1(obj) {
    var rv = [];
    for (var id in obj) {
      var o = obj[id];
      o.id = id.replace(/\*/g, '/');
      rv.push(o);
    }
    return rv;
  }

  function toArray2(obj) {
    var shares = [];
    for (var topic_id in obj) {
      for (var prop_id in obj[topic_id]) {
        var share = obj[topic_id][prop_id];
        share.id = topic_id.replace(/\*/g, '/');
        shares.push(share);
      }
    }
    return shares;
  }

  function doGetShares(shares_ref, limit, callbackSuccess, toArray) {
    var ref = shares_ref.startAt();
    if (limit > 0) {
      ref = ref.limit(limit);
    }
    ref.once('value', function(snapshot) {
      if (snapshot.val() !== null) {
        safeApply($rootScope, function() {
          callbackSuccess(toArray(snapshot.val()));
          return;
        });
      } else {
        console.log('no values in DB');
        safeApply($rootScope, function() {
          callbackSuccess([]);
          return;
        });
      }
    });
  }

  // TODO: c'est presque la même méthode que la précédente...

  function doGetLogs(shares_ref, limit, callbackSuccess, toArray) {
    var ref = logs_ref.startAt();
    if (limit > 0) {
      ref = ref.limit(limit);
    }
    ref.once('value', function(snapshot) {
      if (snapshot.val() !== null) {
        safeApply($rootScope, function() {
          callbackSuccess(toArray(snapshot.val()));
          return;
        });
      } else {
        console.log('no values in DB');
        safeApply($rootScope, function() {
          callbackSuccess([]);
          return;
        });
      }
    });
  }



  return {

    setShareCategory: function(sid, notable_type, notable_type_id) {
      var sanitized_id = sid.replace(/\//g, '*');
      shares_ref.child(sanitized_id).once('value', function(snapshot) {
        var val = snapshot.val();
        for (var prop in val) {
          shares_ref.child(sanitized_id).child(prop).update({
            notable_type: notable_type,
            notable_type_id: notable_type_id
          });
          users_ref.child(prop).child('shares').child(sanitized_id).update({
            notable_type: notable_type,
            notable_type_id: notable_type_id
          });
        }
      });
    },

    setUser: function(u) {
      user = u;
      console.log('connection:');
      console.log(u);
      var userRef = new Firebase(CONFIG.firebaseUrl + '/users/' + u.id);
      var date = (new Date()).getTime();
      userRef.once('value', function(snapshot) {
        if (snapshot.val() === null) {
          // user does not exist
          users_ref.child(u.id).set({
            creationDate: date,
            lastConnection: date,
            name: u.name,
            link: u.link
          });
          var lu_id = lastupdates_ref.push().name(); // generate a unique id based on timestamp
          lastupdates_ref.child(lu_id).set({
            id: lu_id,
            date: date,
            text: u.name,
            ref: 'users',
            action: 'add',
            object_id: u.id
          });
        } else {
          users_ref.child(u.id).update({
            lastConnection: date,
          });
        }
      });
      return u;
    },

    getShares: function(topicId, limit, callbackSuccess) {
      console.log('getShares ' + topicId);
      if (topicId === null) {
        doGetShares(shares_ref, limit, callbackSuccess, toArray2);
      } else {
        topicId = topicId.replace(/\//g, '*');
        var ref = new Firebase(CONFIG.firebaseUrl + '/shares/' + topicId);
        doGetShares(ref, limit, callbackSuccess, toArray1);
      }
    },

    getUserShares: function(callbackSuccess) {
      console.log('getUserShares');
      if (!user) return;

      var ref = users_ref.child(user.id).child('shares');
      ref.once('value', function(snapshot) {
        if (snapshot.val() !== null) {
          safeApply($rootScope, function() {
            callbackSuccess(toArray1(snapshot.val()));
            return;
          });
        } else {
          console.log('no values in DB');
          safeApply($rootScope, function() {
            callbackSuccess([]);
            return;
          });
        }
      });
    },

    getLogs: function(topicId, limit, callbackSuccess) {
      console.log('getShares ' + topicId);
      if (topicId === null) {
        doGetLogs(logs_ref, limit, callbackSuccess, toArray1);
      } else {
        topicId = topicId.replace(/\//g, '*');
        var ref = new Firebase(CONFIG.firebaseUrl + '/searchlogs/' + topicId);
        doGetLogs(ref, limit, callbackSuccess, toArray1);
      }
    },

    getShareContent: function(topicId, callbackSuccess) {
      if (!user) {
        throw 'no user';
      }
      topicId = topicId.replace(/\//g, '*');
      var content_ref = new Firebase(CONFIG.firebaseUrl + '/users/' + user.id + '/shares/*' + topicId + '/content');
      console.log('getShareContent: ' + content_ref);
      content_ref.once('value', function(snapshot) {
        safeApply($rootScope, function() {
          callbackSuccess(snapshot.val());
          return;
        });
      });
    },

    getLastUpdates: function(callbackSuccess) {
      lastupdates_ref.once('value', function(snapshot) {
        safeApply($rootScope, function() {
          callbackSuccess(toArray1(snapshot.val()));
          return;
        });
      });
    },

    getUser: function() {
      return user;
    },

    addShare: function(freebase_id, title, content, image_id, notable_type, notable_type_id) {
      if (!user) {
        throw 'no user';
      }
      if (!image_id) {
        image_id = {};
      }
      if (!notable_type) {
        notable_type = {};
      }
      if (!notable_type_id) {
        notable_type_id = {};
      }
      var sanitized_id = freebase_id.replace(/\//g, '*');
      var date = (new Date()).getTime();
      console.log('Db.addShare ' + sanitized_id + ', ' + title + ', ' + content + ', ' + (-date));
      if (!content) {
        content = '';
      }
      var author = {
        name: user.name,
        id: user.id
      };
      shares_ref.child(sanitized_id).child(author.id).set({
        creationDate: date,
        modificationDate: date,
        title: title,
        content: content,
        author: author,
        image_id: image_id,
        notable_type: notable_type,
        notable_type_id: notable_type_id
      });
      shares_ref.child(sanitized_id).setPriority(-date);
      users_ref.child(author.id).child('shares').child(sanitized_id).update({
        creationDate: date,
        modificationDate: date,
        title: title,
        content: content,
        image_id: image_id,
        notable_type: notable_type,
        notable_type_id: notable_type_id
      });
      users_ref.child(author.id).child('shares').child(sanitized_id).setPriority(-date);
      var lu_id = lastupdates_ref.push().name(); // generate a unique id based on timestamp
      lastupdates_ref.child(lu_id).setWithPriority({
        id: lu_id,
        date: date,
        text: title,
        author: author,
        ref: 'shares',
        action: 'add',
        object_id: sanitized_id,
        image_id: image_id
      }, -date);
      return freebase_id;
    },

    deleteShare: function(id) {
      console.log('deleting ' + id);
      var topic_id = id.replace(/\//g, '*');
      var author = {
        id: user.id,
        name: user.name
      };
      var date = (new Date()).getTime();
      var ref = shares_ref.child(topic_id).child(user.id);
      ref.once('value', function(s) {
        var lu_id = lastupdates_ref.push().name(); // generate a unique id based on timestamp
        lastupdates_ref.child(lu_id).set({
          id: lu_id,
          date: date,
          text: s.val().title,
          author: author,
          ref: 'shares',
          action: 'delete',
          object_id: topic_id
        });
        ref.remove();
      });
      var usershare_ref = new Firebase(CONFIG.firebaseUrl + '/users/' + user.id + '/shares/' + topic_id);
      usershare_ref.remove();
    },

    /*
    getShareForUser: function(user_id, topic_id) {

    },
*/
    logSearch: function(title, id) {
      if (!title) {
        title = {};
      }
      if (!id) {
        id = {};
      }
      var sanitized_id = id.replace(/\//g, '*');
      var date = (new Date()).getTime();
      var author = {};
      if (user) {
        author = {
          name: user.name,
          id: user.id
        };
      }

      var ref = logs_ref.child(sanitized_id);
      ref.once('value', function(s) {
        if (s.val() === null) { // no log for this id
          logs_ref.child(sanitized_id).setWithPriority({
            title: title,
            id: sanitized_id,
            date: date,
            nb: 1
          }, -date);
        } else { // already searched before
          logs_ref.child(sanitized_id).update({
            date: date,
            nb: s.val().nb + 1 // increment the nb
          });
          logs_ref.child(sanitized_id).setPriority(-date);
        }
        // add the author
        if (user) {
          logs_ref.child(sanitized_id).child('authors').child(author.id).setWithPriority(author, -date);
        }
      });

    },

    addComment: function(sid, text) {
      if (!sid) {
        console.log('no share id');
        return null;
      }
      var author = {
        id: user.id,
        name: user.name
      };
      var date = (new Date()).getTime();
      var id = shares_ref.child(sid).child('comments').push().name(); // generate a unique id based on timestamp
      var comment = {
        id: id,
        text: text,
        author: author,
        date: date
      };
      shares_ref.child(sid).child('comments').child(id).set(comment);

      var ref = shares_ref.child(sid);
      ref.once('value', function(s) {
        var lu_id = lastupdates_ref.push().name(); // generate a unique id based on timestamp
        lastupdates_ref.child(lu_id).set({
          id: lu_id,
          date: date,
          text: 'commented on ' + s.val().title,
          author: author,
          ref: 'comments',
          action: 'add',
          object_id: id,
          parent_id: sid
        });
      });
      return comment;
    },

    deleteComment: function(sid, cid) {
      var author = {
        id: user.id,
        name: user.name
      };
      var date = (new Date()).getTime();
      var ref = shares_ref.child(sid);
      ref.once('value', function(s) {
        var lu_id = lastupdates_ref.push().name(); // generate a unique id based on timestamp
        lastupdates_ref.child(lu_id).set({
          id: lu_id,
          date: date,
          text: 'deleted a comment on ' + s.val().title,
          author: author,
          ref: 'comments',
          action: 'delete',
          object_id: cid,
          parent_id: sid
        });
      });
      shares_ref.child(sid).child('comments').child(cid).remove();
    },

    /*    newSubject : function (obj, callbackForAddingComment) {
      var comments_ref = new Firebase(CONFIG.firebaseUrl + '/subjects/'+obj.id+'/comments');
      comments_ref.on('child_added', function(snapshot) {
        safeApply($rootScope, function(){
          callbackForAddingComment(obj.id, snapshot.val());
          return;
        });
      });

      obj.hasStateForCurrentUser= function(state) {
          return(this.states && this.states[user.id] && this.states[user.id].state && this.states[user.id].state == state);
        };

      obj.hasNoState= function() {
          return(!this.states || !this.states[user.id] || !this.states[user.id].state);
        };

      return obj;
    },
*/
  };

});
