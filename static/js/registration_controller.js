var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

    $scope.college = 'Imperial College London';
    
    $scope.wsonopen = function(ws) {
        var msgobj = {};
        msgobj.type = 'validatetoken';
        msgobj.user_token = localStorage.token;
        ws.send(JSON.stringify(msgobj));
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

    $scope.sign_up = function() {

        var msgobj = {};
        msgobj.type = 'registration';
        msgobj.email = $scope.email;
        msgobj.nickname = $scope.nickname;
        msgobj.college = $scope.college;
        if ($scope.password1 != $scope.password2) {
            alert("Your passwords do not match");
            return;
        }
        msgobj.password = $scope.password1;
        ws.send(JSON.stringify(msgobj));
    };

});
