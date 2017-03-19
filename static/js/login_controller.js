var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

    $scope.wsonopen = function(ws) {
        if (localStorage.token) {
            var msgobj = {};
            msgobj.type = 'validatetoken';
            msgobj.user_token = localStorage.token;
            ws_send(JSON.stringify(msgobj));
        }
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
        } else if (type == 'loginfail') {
            Materialize.toast("Login failed", 2000);
        } else if (type == 'alert') {
            Materialize.toast(raw_data.msg, 5000);
        } if (type == 'loginfirst') {
            $scope.do_logout();
            $scope.$apply();
        }
    }

// WS MODULES LOADED HERE
#include<clientws.js>

    $scope.sign_in = function() {
        var msgobj = {};
        msgobj.type = 'login';
        msgobj.email = $scope.email;
        msgobj.password = $scope.password;
        ws_send(JSON.stringify(msgobj));
    };

    $scope.do_logout = function() {
        localStorage.clear();
        window.location = '/';
    }

});
