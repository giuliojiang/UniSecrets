var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

    $scope.college = 'Imperial College London';
    
    $scope.wsonopen = function(ws) {
        var msgobj = {};
        msgobj.type = 'validatetoken';
        msgobj.user_token = localStorage.token;
        ws_send(JSON.stringify(msgobj));
    }
    
    $scope.wsmessage = function(ws, data) {
        var msgobj = JSON.parse(data);
        var type = msgobj.type;
        if (type == 'alert') {
            alert(msgobj.msg);
        } else if (type == 'tokenok') {
            window.location = 'dashboard.html';
        }
    }
    
// WS MODULES LOADED HERE
#include<clientws.js>

    $scope.submit = function() {

        var msgobj = {};
        msgobj.type = 'activationcode';
        msgobj.email = $scope.email;
        msgobj.code = $scope.code;
        ws_send(JSON.stringify(msgobj));
        
    };

});
