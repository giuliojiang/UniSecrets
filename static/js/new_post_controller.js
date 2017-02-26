var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

    $scope.wsonopen = function(ws) {
        var msgobj = {};
        msgobj.type = 'validatetoken';
        msgobj.user_token = localStorage.token;
        ws_send(JSON.stringify(msgobj));
    }

    $scope.wsmessage = function(ws, data) {
        var msgobj = JSON.parse(data);
        var type = msgobj.type;
        if (type == 'loginfirst') {
            alert('You need to login first!');
            window.location = 'login';
        } else if (type == 'postsuccess') {
            $scope.post_sent = true;
            $scope.$apply();
        } else if (type == 'alert') {
            alert(msgobj.msg);
        }
    }

// WS MODULES LOADED HERE
#include<clientws.js>

    $scope.post = function() {
        var msgobj = {}
        msgobj.type = "new_post";
        msgobj["public"] = $scope.is_public;
        msgobj.text = $scope.text;
        msgobj.user_token = localStorage.token;

        ws_send(JSON.stringify(msgobj));
    };
    
    $scope.do_logout = function() {
        localStorage.clear();
        location.reload();
    }
    
    $scope.goto_dashboard = function() {
        window.location = 'dashboard';
    }
    
});
