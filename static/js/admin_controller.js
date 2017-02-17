var mainApp = angular.module("mainApp", ['ngSanitize']);

mainApp.controller("main_controller", function($scope) {

    $scope.colleges = [];

    $scope.wsonopen = function(ws) {
        // Send message to request list of unactivated colleges
        var msgobj = {};
        msgobj.type = 'pendingcollegeslist';
        msgobj.user_token = localStorage.token;
        ws_send(JSON.stringify(msgobj));

        // send message to request list of unapproved posts
        msgobj = {};
        msgobj.type = 'get_unapproved_posts';
        msgobj.user_token = localStorage.token;
        ws_send(JSON.stringify(msgobj));
    }

    $scope.wsmessage = function(ws, data) {
        var raw_data = JSON.parse(data);
        var type = raw_data.type;
        if (type == 'loginfirst') {
            alert('You are not logged in');
            window.location = 'login';
            return;
        } else if (type == 'pendingcollegelist') {
            $scope.colleges = raw_data.colleges;
            $scope.$apply();
        } else if (type == 'unapproved_posts') {
            $scope.pending_posts = raw_data.posts;
            $scope.$apply();
        }

    }

// WS MODULES LOADED HERE
#include<clientws.js>

    $scope.accept_college = function(clg, accept) {
        var msgobj = {};
        msgobj.type = 'pendingcollegeaction';
        msgobj.user_token = localStorage.token;
        msgobj.accept = accept;
        msgobj.college = clg.college;
        msgobj.domain = clg.domain;
        ws_send(JSON.stringify(msgobj));
    };

    $scope.accept_post = function(pst, accept) {
        var msgobj = {};
        msgobj.type = 'approve_post';
        msgobj.user_token = localStorage.token;
        msgobj.accept = accept;
        msgobj.postid = pst.postid;
        ws_send(JSON.stringify(msgobj));
    };

});
