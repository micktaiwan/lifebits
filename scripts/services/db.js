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
      share['id'] = id.replace(/_/g, '/');
      shares.push(share);
    }
    return shares;
  };

  function toArray2(obj) {
    var shares = [];
    for (var topic_id in obj) {
      for (var prop_id in obj[topic_id]) {
        var share = obj[topic_id][prop_id];
        share['id'] = topic_id.replace(/_/g, '/');
        shares.push(share);
      }
    }
    return shares;
  };

  function doGetShares(shares_ref, callbackSuccess, toArray) {
    shares_ref.once('value', function(snapshot) {
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

    getShares: function(topicId, callbackSuccess) {
      console.log('getShares ' + topicId);
      if (topicId === null) {
        doGetShares(shares_ref, callbackSuccess, toArray2);
      } else {
        topicId = topicId.replace(/\//g, '_');
        var ref = new Firebase(CONFIG.firebaseUrl + '/shares/' + topicId);
        doGetShares(ref, callbackSuccess, toArray1);
      }

    },

    getUser: function() {
      return user;
    },

    addShare: function(freebase_id, title, content) {
      freebase_id = freebase_id.replace(/\//g, '_');
      console.log('Db.addShare ' + freebase_id + ", " + title + ", " + content);
      var date = (new Date()).getTime();
      if (!content) content = '';
      var author = {
        name: user.name,
        id: user.id
      };
      shares_ref.child(freebase_id).child(author.id).set({
        creationDate: date,
        modificationDate: date,
        title: title,
        content: content,
        author: author
      });
      users_ref.child(author.id).child('shares').child(freebase_id).update({
        creationDate: date,
        modificationDate: date,
        title: title,
        content: content
      });
      var lu_id = lastupdates_ref.push().name(); // generate a unique id based on timestamp
      lastupdates_ref.child(lu_id).set({
        id: lu_id,
        date: date,
        text: title,
        author: author,
        ref: "shares",
        action: "add",
        object_id: freebase_id
      });
      return freebase_id;
    },

    deleteShare: function(id) {
      var author = {
        id: user.id,
        name: user.name
      };
      var date = (new Date()).getTime();
      var ref = shares_ref.child(id);
      ref.once('value', function(s) {
        var lu_id = lastupdates_ref.push().name(); // generate a unique id based on timestamp
        lastupdates_ref.child(lu_id).set({
          id: lu_id,
          date: date,
          text: 'deleted share ' + s.val().title,
          author: author,
          ref: "shares",
          action: "delete",
          object_id: id
        });
        shares_ref.child(id).remove();
      });
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
