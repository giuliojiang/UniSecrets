var auth = require( __dirname + '/auth.js');

// #############################################################################
// WEBSOCKET PART
var ws = require("nodejs-websocket")

var server = ws.createServer(function (conn) {
    console.log("New connection")
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
        } else {
            console.log('Unrecognized message type ' + type);
            return;
        }
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })
}).listen(8001);
