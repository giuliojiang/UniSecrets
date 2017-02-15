var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

    $scope.show_add_college = false;
    
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
        } else if (type == 'toactivation') {
            $scope.show_activation_message = true;
            $scope.$apply();
        } else if (type == 'collegenotfound') {
            $scope.show_add_college = true;
            $scope.$apply();
        }
    }
    
// WS MODULES LOADED HERE
#include<clientws.js>

    $scope.sign_up = function() {

        var msgobj = {};
        msgobj.type = 'registration';
        msgobj.email = $scope.email;
        msgobj.nickname = $scope.nickname;
        if ($scope.password1 != $scope.password2) {
            alert("Your passwords do not match");
            return;
        }
        msgobj.password = $scope.password1;
        ws_send(JSON.stringify(msgobj));
    };
    
    $scope.add_college = function() {
        var msgobj = {};
        msgobj.type = 'addcollege';
        msgobj.email = $scope.email;
        msgobj.college = $scope.collegename;
        ws_send(JSON.stringify(msgobj));
    }

});
