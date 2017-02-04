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
    
    var msgobj = JSON.parse(data);
    var type = msgobj.type;
    if (type == 'loginfirst') {
        alert('You need to login first!');
        window.location = 'login.html';
    } else if (type == 'postsuccess') {
        window.location = 'dashboard.html';
    }
  };

  ws.onclose = function()
  {
    console.log('Closed websocket');
  };

  $scope.post = function() {
    var msgobj = {}
    msgobj.type = "new_post";
    msgobj["public"] = $scope.is_public;
    msgobj.text = $scope.text;
    msgobj.user_token = localStorage.token;

    ws.send(JSON.stringify(msgobj));
  };
});
