var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

    // Read the window location hash
    var activation_string = null;
    var activation_email = null;
    var activation_token = null;
    
    var read_hash = function() {
        if (window.location.hash) {
            activation_string = window.location.hash.substring(1);
            var activation_string_split = activation_string.split(';');
            activation_email = null;
            activation_token = null;
            if (activation_string_split.length == 2) {
                activation_email = activation_string_split[0];
                activation_token = activation_string_split[1];
            }
        } else {
            $scope.invalid_link = true;
        }
    };
    
    read_hash();
    
    var do_activation = function() {
        if (activation_email && activation_token) {
            msgobj = {};
            msgobj.type = 'activationcode';
            msgobj.email = activation_email;
            msgobj.code = activation_token;
            ws_send(JSON.stringify(msgobj));
        } else {
            $scope.invalid_link = true;

            $scope.$apply();
        }
    };


    $scope.college = 'Imperial College London';

    $scope.wsonopen = function(ws) {
        var msgobj = {};
        msgobj.type = 'validatetoken';
        msgobj.user_token = localStorage.token;
        ws_send(JSON.stringify(msgobj));

        do_activation();
    }

    $scope.wsmessage = function(ws, data) {
        var msgobj = JSON.parse(data);
        var type = msgobj.type;
        if (type == 'alert') {
            Materialize.toast(msgobj.msg, 5000);
        } else if (type == 'tokenok') {
            window.location = 'dashboard';
        } else if (type == 'activationsuccess') {
            $scope.account_activated = true;
            $scope.$apply();
        } else if (type == 'logintoken') {
            localStorage.token = msgobj.token;

            var is_admin = msgobj.admin;
            localStorage.admin = is_admin;

            $scope.logged_in = true;

            $scope.$apply();
        }
    }

// WS MODULES LOADED HERE
#include<clientws.js>

    $scope.go_to_dashboard = function() {
        window.location = 'dashboard';
    }
    
    $scope.do_logout = function() {
        localStorage.clear();
        window.location = '/';
    }
    
    $(window).on('hashchange', function() {
        read_hash();
        do_activation();
    });

});
