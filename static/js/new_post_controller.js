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
