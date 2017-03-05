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
        if (!($scope.f_password1 == $scope.f_password2)) {
            Materialize.toast('Passwords do not match', 5000);
            return;
        }

        var msgobj = {};
        msgobj.type = "first_time_form";
        msgobj.username = $scope.f_username;
        msgobj.email = $scope.f_email;
        msgobj.college = $scope.f_college;
        msgobj.password = $scope.f_password1;
        ws_send(JSON.stringify(msgobj));
    }

});
