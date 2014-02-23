'use strict';

angular.module('lifebitsApp.services.db', []).factory('Db', function($rootScope, $location, CONFIG) {

  var user;

  var shares = [];
  var shares_ref = new Firebase(CONFIG.firebaseUrl + '/shares');
  var users_ref = new Firebase(CONFIG.firebaseUrl + '/users');
  var lastupdates_ref = new Firebase(CONFIG.firebaseUrl + '/lastupdates');

  function safeApply(scope, fn) {
    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
  };

  function toArray1(obj) {
    var shares = [];
    for (var id in obj) {
      var share = obj[id];
      share['id'] = id.replace(/\*/g, '/');
      shares.push(share);
    }
    return shares;
  };

  function toArray2(obj) {
    var shares = [];
    for (var topic_id in obj) {
      for (var prop_id in obj[topic_id]) {
        var share = obj[topic_id][prop_id];
        share['id'] = topic_id.replace(/\*/g, '/');
        shares.push(share);
      }
    }
    return shares;
  };

  function doGetShares(shares_ref, limit, callbackSuccess, toArray) {
    var ref = shares_ref.startAt();
    if (limit > 0)
      ref = ref.limit(limit);

    /*      ref.once('value', function(snapshot) {
        snapshot.forEach(function(childSnap) {
          console.log(childSnap.val());
          childSnap.forEach(function(subChild) {
            childSnap.ref().setPriority(-subChild.val().modificationDate);
            //break;
          });
        });
      });
*/
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
  };


  return {

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
            ref: "users",
            action: "add",
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
    getShareContent: function(topicId, callbackSuccess) {
      if (!user)
        throw 'no user';
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
    getUser: function() {
      return user;
    },

    addShare: function(freebase_id, title, content, image_id) {
      if (!user)
        throw 'no user';
      if (!image_id) image_id = {};
      var sanitized_id = freebase_id.replace(/\//g, '*');
      var date = (new Date()).getTime();
      console.log('Db.addShare ' + sanitized_id + ", " + title + ", " + content + ', ' + (-date));
      if (!content) content = '';
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
        image_id: image_id
      });
      shares_ref.child(sanitized_id).setPriority(-date);
      users_ref.child(author.id).child('shares').child(sanitized_id).update({
        creationDate: date,
        modificationDate: date,
        title: title,
        content: content,
        image_id: image_id
      });
      var lu_id = lastupdates_ref.push().name(); // generate a unique id based on timestamp
      lastupdates_ref.child(lu_id).setWithPriority({
        id: lu_id,
        date: date,
        text: title,
        author: author,
        ref: "shares",
        action: "add",
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
          text: 'deleted share ' + s.val().title,
          author: author,
          ref: "shares",
          action: "delete",
          object_id: topic_id
        });
        ref.remove();
      });
      var usershare_ref = new Firebase(CONFIG.firebaseUrl + '/users/' + user.id + '/shares/' + topic_id);
      usershare_ref.remove();
    },

    getShareForUser: function(user_id, topic_id) {

    },

    addComment: function(sid, text) {
      if (!sid) {
        console.log("no share id");
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
          ref: "comments",
          action: "add",
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
          ref: "comments",
          action: "delete",
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
