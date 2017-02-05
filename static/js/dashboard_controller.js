var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

    $scope.page = 0;
    
    $scope.wsopen = function(ws) {
        // send first request for posts
        var msgobj = {};
        msgobj.type = 'requestposts';
        msgobj.user_token = localStorage.token;
        msgobj.page = $scope.page;
        ws.send(JSON.stringify(msgobj));
    }
    
    $scope.wsmessage = function(ws, data) {
        var raw_data = JSON.parse(data);
        var type = raw_data.type;
        if (type == 'logintoken') {
        localStorage.token = raw_data.token;
        } else if (type == 'postlist') {
            $scope.postlist = raw_data;
            $scope.$apply();
        } else if (type == 'loginfirst') {
            window.location = 'login.html';
        }
    }
    
// WS MODULES LOADED HERE
#include<clientws.js>

});
