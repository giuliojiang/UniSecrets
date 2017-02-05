var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

    $scope.wsonopen = function(ws) {

    }
    
    $scope.wsmessage = function(ws, data) {
        var raw_data = JSON.parse(data);
        var type = raw_data.type;
        if (type == 'logintoken') {
            localStorage.token = raw_data.token;
            window.location = 'dashboard.html';
        } else {
            alert("You failed to login");
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
