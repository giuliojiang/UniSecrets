var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

    $scope.wsonopen = function(ws) {
        var msgobj = {};
        msgobj.type = 'validatetoken';
        msgobj.user_token = localStorage.token;
        ws_send(JSON.stringify(msgobj));
    }
    
    $scope.goto_dashboard_or_post = function() {
        if (localStorage.postid) {
            window.location = 'post.html#' + localStorage.postid;
        } else {
            window.location = 'dashboard.html';
        }
    }
    
    $scope.wsmessage = function(ws, data) {
        var raw_data = JSON.parse(data);
        var type = raw_data.type;
        if (type == 'logintoken') {
            localStorage.clear();
            localStorage.token = raw_data.token;
            
            var is_admin = raw_data.admin;
            localStorage.admin = is_admin;
            
            $scope.goto_dashboard_or_post();
        } else if (type == 'tokenok') {
            $scope.goto_dashboard_or_post();
        } else if (type == 'loginfail') {
            alert('Login failed');
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


});
