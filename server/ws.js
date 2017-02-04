var auth = require( __dirname + '/auth.js');
var posts = require(__dirname + '/posts.js');
var session = require( __dirname + '/session.js');

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

        var email = undefined;
        
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
        } else {
            email = session.validate_token(msgobj.user_token);
            if (!email) {
                session.send_login_first(conn);
                return;
            }
        }
        
        // All handlers after here require you to be logged in first!
            
        if (type == 'new_post') {
            var is_public = msgobj['public'];
            var text = msgobj.text;
            posts.new_post(email, is_public, text, conn);
        } else if (type == 'requestposts') {
//             {
//                 type: requestposts,
//                 user_token: dfh2UMV0fmfimSVju9rwm,
//                 page: 0
//             }
            var page = msgobj.page;
            posts.send_list(email, page, conn);
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
