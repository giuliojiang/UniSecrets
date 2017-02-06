var mainApp = angular.module("mainApp", ['ngSanitize']);

mainApp.controller("main_controller", function($scope) {

    var desired_post_id = window.location.hash.substring(1); // Removes the hash
    localStorage.postid = desired_post_id;
    
    $scope.show_not_found = false;

    $scope.set_show_comments_to_false = function() {
        $scope.apost.show_comments = false;
    };

    $scope.toggle_post_comments = function(post_id) {
        if (apost.id == post_id) {
            apost.show_comments ? apost.show_comments = false : apost.show_comments = true;
        }
    };
    
    var request_post = function(ws) {
        var msgobj = {};
        msgobj.type = 'getpost';
        msgobj.user_token = localStorage.token;
        msgobj.postid = localStorage.postid;
        ws.send(JSON.stringify(msgobj));
    }

    $scope.wsonopen = function(ws) {
        request_post(ws);
    }
    
    $scope.wsmessage = function(ws, data) {
        var raw_data = JSON.parse(data);
        var type = raw_data.type;
        
        if (type == 'loginfirst') {
            window.location = 'login.html';
        } else if (type == 'updatepost') {
            $scope.show_not_found = false;
            
            var postid = raw_data.id;

            $scope.apost = {};
            var thepost = $scope.apost;
            thepost.id = raw_data.id;
            thepost.text = raw_data.text;
            thepost.likes = raw_data.likes;
            thepost.dislikes = raw_data.dislikes;
            thepost.college = raw_data.college;
            thepost.comments = raw_data.comments;
            
            $scope.$apply();
            
            delete localStorage['postid'];
        } else if (type == 'postnotfound') {
            // set apost to empty
            $scope.apost = {};
            
            // reset local localStorage
            delete localStorage['postid'];
            
            // show a message that post was not found
            $scope.show_not_found = true;
            
            $scope.$apply();
        }
    }

// WS MODULES LOADED HERE
#include<clientws.js>

    $scope.post_comment = function(postid, text, postobj) {
        var msgobj = {};
        msgobj.type = 'new_comment';
        msgobj.user_token = localStorage.token;
        msgobj.text = text;
        msgobj.postid = postid;
        
        ws.send(JSON.stringify(msgobj));
        
        postobj.user_comment = '';
    }
    
    $scope.reload_page = function() {
        location.reload();
    }
    
    $scope.likepost = function(postid, is_like) {
        var msgobj = {};
        msgobj.type = 'like';
        msgobj.user_token = localStorage.token;
        msgobj.postid = postid;
        msgobj.value = is_like;
        ws.send(JSON.stringify(msgobj));
    }
    
    $(window).on('hashchange', function() {
        var desired_post_id = window.location.hash.substring(1); // Removes the hash
        localStorage.postid = desired_post_id;
        request_post(ws);
    });

});
