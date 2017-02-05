var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

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
            window.location = 'dashboard.html';
        } else if (type == 'tokenok') {
            window.location = 'dashboard.html';
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
        ws.send(JSON.stringify(msgobj));
    };


});
