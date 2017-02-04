var auth = require( __dirname + '/auth.js');
var posts = require(__dirname + '/posts.js');

// #############################################################################
// WEBSOCKET PART
var ws = require("nodejs-websocket")

var server = ws.createServer(function (conn) {
    console.log("New connection");
    conn.on("text", function (str) {
        console.log("Received "+str)

        var msgobj = JSON.parse(str);
        if (!msgobj) {
            console.log("Cannot parse message to JSON");
            return;
        }
        var type = msgobj.type;

        if (type == 'login') {
            var email = msgobj.email;
            var password = msgobj.password;

            // try to authenticate
            auth.authenticate(email, password, conn);
        } else if (type == 'registration') {
          var email = msgobj.email;
          var nickname = msgobj.nickname;
          var college = msgobj.college;
          var password = msgobj.password;

          auth.add_user(email, nickname, college, password);
        } else if (type == 'new_post') {
            var user_token = msgobj.user_token;
            var is_public = msgobj['public'];
            var text = msgobj.text;
            posts.new_post(user_token, is_public, text, conn);
        }
        else {
            console.log('Unrecognized message type ' + type);
            return;
        }
    });
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    });
    conn.on('error', function(err) {
        console.log('WebSocket error: ' + err);
    });
}).listen(8001);
