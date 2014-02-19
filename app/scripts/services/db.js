'use strict';

angular.module('lifebitsApp.services.db', []).factory('Db', function($rootScope, $location, CONFIG) {

    var user;

    var shares = [];
    var shares_ref = new Firebase(CONFIG.firebaseUrl + '/shares');
    var lastupdates_ref = new Firebase(CONFIG.firebaseUrl + '/lastupdates');

    function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    };

    return {

        setUser: function(u) {
            user = u;
            console.log('connection: ' + u.name + ", " + u.id);
            return u;
        },

        getShares: function(callbackSuccess) {
            shares_ref.once('value', function(snapshot) {
                if (snapshot.val() !== null) {
                    safeApply($rootScope, function() {
                        callbackSuccess(snapshot.val());
                        return;
                    });
                } else {
                    console.log('no values in DB');
                }
            });
        },

        getUser: function() {
            return user;
        },

        addShare: function(id, title, content) {
            console.log('Db.addShare ' + id + ", " + title + ", " + content);
            var date = (new Date()).getTime();
            if (!content) content = '';
            var author = {
                name: user.name,
                id: user.id
            };
            var id = shares_ref.push().name(); // generate a unique id based on timestamp
            shares_ref.child(id).set({
                id: id,
                creationDate: date,
                modificationDate: date,
                title: title,
                content: content,
                author: author
            });
            var lu_id = lastupdates_ref.push().name(); // generate a unique id based on timestamp
            lastupdates_ref.child(lu_id).set({
                id: lu_id,
                date: date,
                text: 'shared ' + title,
                author: author,
                ref: "shares",
                action: "add",
                object_id: id
            });
            return id;
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
