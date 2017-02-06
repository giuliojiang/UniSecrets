var mainApp = angular.module("mainApp", ['ngSanitize']);

mainApp.controller("main_controller", function($scope) {

    $scope.page = 0;

    $scope.set_show_comments_to_false = function() {
        angular.forEach($scope.postlist.posts, function(post) {
        post.show_comments = false;
        });
    };

    $scope.toggle_post_comments = function(post_id) {
        var postlist_len = $scope.postlist.posts.length;
        angular.forEach($scope.postlist.posts, function(post) {
        if (post.id == post_id) {
            post.show_comments ? post.show_comments = false : post.show_comments = true;
        }
        });
    };

    $scope.wsonopen = function(ws) {
        var msgobj = {};
        msgobj.type = 'validatetoken';
        msgobj.user_token = localStorage.token;
        ws.send(JSON.stringify(msgobj));
    }
    
    $scope.wsmessage = function(ws, data) {
        var raw_data = JSON.parse(data);
        var type = raw_data.type;
        if (type == 'logintoken') {
            localStorage.token = raw_data.token;
        } else if (type == 'postlist') {
            $scope.postlist = raw_data;
            $scope.set_show_comments_to_false();
            $scope.$apply();
        } else if (type == 'loginfirst') {
            window.location = 'login.html';
        } else if (type == 'updatepost') {
            var postid = raw_data.id;
            
            if (!$scope.postlist) {
                return;
            }
            if (!$scope.postlist.posts) {
                return;
            }
            
            for (var i = 0; i < $scope.postlist.posts.length; i++) {
                if ($scope.postlist.posts[i].id == postid) {
                    var thepost = $scope.postlist.posts[i];
                    thepost.id = raw_data.id;
                    thepost.text = raw_data.text;
                    thepost.likes = raw_data.likes;
                    thepost.dislikes = raw_data.dislikes;
                    thepost.college = raw_data.college;
                    thepost.comments = raw_data.comments;
                }
            }
            
            $scope.$apply();
        } else if (type == 'tokenok') {
            if (localStorage.postid) {
                window.location = 'post.html#' + localStorage.postid;
            } else {
                // send first request for posts
                var msgobj = {};
                msgobj.type = 'requestposts';
                msgobj.user_token = localStorage.token;
                msgobj.page = $scope.page;
                ws.send(JSON.stringify(msgobj));
            }
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
    
    $scope.generate_post_link = function(postid) {
        return 'post.html#' + postid;
    }

});
