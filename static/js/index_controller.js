var mainApp = angular.module("mainApp", ['ngSanitize']);

mainApp.controller("main_controller", function($scope) {

    $scope.wsonopen = function(ws) {
        if (localStorage.token) {
            var msgobj = {};
            msgobj.type = 'validatetoken';
            msgobj.user_token = localStorage.token;
            ws_send(JSON.stringify(msgobj));
        }
        var msgobj = {};
        msgobj.type = 'homepage_list';
        ws_send(JSON.stringify(msgobj));
    }

    $scope.goto_dashboard_or_post = function() {
        var target_post = localStorage.postid;

        if (target_post) {
            window.location = 'post#' + target_post;
        } else {
            window.location = 'dashboard';
        }
    }

    $scope.wsmessage = function(ws, data) {
        var raw_data = JSON.parse(data);
        var type = raw_data.type;
        if (type == 'logintoken') {
            localStorage.token = raw_data.token;

            var is_admin = raw_data.admin;
            localStorage.admin = is_admin;

            $scope.goto_dashboard_or_post();
        } else if (type == 'tokenok') {
            $scope.goto_dashboard_or_post();
        } else if (type == 'loginfail') {
            Materialize.toast("Login failed", 2000);
        } else if (type == 'alert') {
            Materialize.toast(raw_data.msg, 5000);
        } else if (type == 'loginfirst') {
            $scope.do_logout();
            $scope.$apply();
        } else if (type == 'homepage_post_list') {
            $scope.posts = raw_data.posts;
            $scope.$apply();
        } else if (type == 'goto_setup') {
            window.location = 'firsttimesetup';
        }

    }

// WS MODULES LOADED HERE
#include<clientws.js>

    $scope.do_logout = function() {
        localStorage.clear();
        location.reload();
    }
    
    $scope.goto_login = function() {
        window.location = 'login';
    }
    
    $scope.goto_register = function() {
        window.location = 'register';
    }

});
