var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

    $scope.is_public = false;
    
    $scope.wsonopen = function(ws) {
        if (localStorage.token) {
            var msgobj = {};
            msgobj.type = 'validatetoken';
            msgobj.user_token = localStorage.token;
            ws_send(JSON.stringify(msgobj));
        }
    }

    $scope.wsmessage = function(ws, data) {
        var msgobj = JSON.parse(data);
        var type = msgobj.type;
        if (type == 'postsuccess') {
            $scope.post_sent = true;
            $scope.$apply();
        } else if (type == 'alert') {
            Materialize.toast(msgobj.msg, 5000);
        } else if (type == 'tokenok') {
            window.location = 'new_post';
        }
    }

// WS MODULES LOADED HERE
#include<clientws.js>

    $scope.post = function() {
        var msgobj = {}
        msgobj.type = "new_post_anon";
        msgobj["public"] = $scope.is_public;
        msgobj.text = $scope.text;

        ws_send(JSON.stringify(msgobj));
    };
    
    $scope.do_logout = function() {
        localStorage.clear();
        location.reload();
    }
    
    $scope.goto_dashboard = function() {
        window.location = '/';
    }
    
});
