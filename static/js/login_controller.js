var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

  var ws = new WebSocket("ws://secrets.jstudios.ovh:8001");

  ws.onopen = function()
  {
    console.log('Connection opened');
  };

  ws.onmessage = function (evt)
  {
    var data = evt.data;
    console.log('Received ' + data);
    var raw_data = JSON.parse(data);
    var type = raw_data.type;
    if (type == 'logintoken') {
      localStorage.token = raw_data.token;
      window.location = 'dashboard.html';
    } else {
      alert("You failed to login");
    }

  };

  ws.onclose = function()
  {
    console.log('Closed websocket');
  };

  $scope.sign_in = function() {
    var msgobj = {};
    msgobj.type = 'login';
    msgobj.email = $scope.email;
    msgobj.password = $scope.password;
    ws.send(JSON.stringify(msgobj));
  };


});
