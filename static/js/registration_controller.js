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
