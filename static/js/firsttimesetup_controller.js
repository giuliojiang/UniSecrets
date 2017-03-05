var mainApp = angular.module("mainApp", ['ngSanitize']);

mainApp.controller("main_controller", function($scope) {

    $scope.wsonopen = function(ws) {

    }

    $scope.wsmessage = function(ws, data) {
        var raw_data = JSON.parse(data);
        var type = raw_data.type;
        if (type == '??????') {

        }

    }

// WS MODULES LOADED HERE
#include<clientws.js>

    $scope.send_form = function() {
        
    }

});
