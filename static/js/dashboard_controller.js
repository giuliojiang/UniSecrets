var mainApp = angular.module("mainApp", []);

mainApp.controller("main_controller", function($scope) {

    $scope.page = 0;
    
  var ws = new WebSocket("ws://secrets.jstudios.ovh:8001");

  ws.onopen = function()
  {
      console.log('Connection opened');
      
      // send first request for posts
      var msgobj = {};
      msgobj.type = 'requestposts';
      msgobj.user_token = localStorage.token;
      msgobj.page = $scope.page;
      ws.send(JSON.stringify(msgobj));
  };

  ws.onmessage = function (evt)
  {
    var data = evt.data;
    console.log('Received ' + data);
    var raw_data = JSON.parse(data);
    var type = raw_data.type;
    if (type == 'logintoken') {
      localStorage.token = raw_data.token;
    } else if (type == 'postlist') {
        $scope.postlist = raw_data;
        $scope.set_show_comments_to_false();
        $scope.$apply();
    } else if (type == 'loginfirst') {
        window.location = 'login.html';
    }

  };

  ws.onclose = function()
  {
    console.log('Closed websocket');
  };

  $scope.set_show_comments_to_false = function() {
    angular.forEach($scope.postlist.posts, function(post) {
      post.show_comments = false;
    });
  };

  $scope.toggle_post_comments = function(post_id) {
    var postlist_len = $scope.postlist.posts.length;
    angular.forEach($scope.postlist.posts, function(post) {
      if (post.id == post_id) {
        post.show_comments ? post.show_comments = false : post.show_comments = true;
      }
    });
  };

});
