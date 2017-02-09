var auth = require( __dirname + '/auth.js');
var posts = require(__dirname + '/posts.js');
var session = require( __dirname + '/session.js');
var fs = require('fs');

// #############################################################################
// WEBSOCKET PART
var ws = require("ws");
var WebSocketServer = ws.Server;

// Load configuration
var config_file = fs.readFileSync(__dirname + '/../config/server_config.json');
var config = JSON.parse(config_file);

var server = undefined;
var app = null;
var processRequest = function(req, res) {
    res.writeHead(200);
    res.end('');
};

if (config.use_ssl) {
    app = require('https').createServer( {
        key: fs.readFileSync(config.ssl_privkey),
        cert: fs.readFileSync(config.ssl_certificate)
    }, processRequest).listen(8001);
} else {
    app = require('http').createServer(processRequest).listen(8001);
}

server = new WebSocketServer({server: app});

server.on('connection', function(conn) {
    console.log("New connection");
    conn.on("message", function (str) {
        var msgobj = JSON.parse(str);
        if (!msgobj) {
            console.log("Cannot parse message to JSON");
            return;
        }
        var type = msgobj.type;

        var email = undefined;
        
        // ========= UNAUTHENTICATED MESSAGES ================
        if (type == 'login') {
            var email = msgobj.email;
            var password = msgobj.password;

            // try to authenticate
            auth.authenticate(email, password, conn);
            
            return;
        } else if (type == 'registration') {
          var email = msgobj.email;
          var nickname = msgobj.nickname;
          var password = msgobj.password;

          auth.add_user(email, nickname, password, conn);
          
          return;
        } else if (type == 'activationcode') {
            var email = msgobj.email;
            var code = msgobj.code;
            auth.activate_account(email, code, conn);
        } else if (type == 'addcollege') {
//         {
//             type: addcollege,
//             email: poifhjsoper@fojs.ic.ac.uk,
//             college: "bella de padella"
//         }
            var email = msgobj.email;
            var college = msgobj.college;
            auth.add_college(email, college, conn);
        }
        // ========= AUTHENTICATED MESSAGES ================
        else {
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
            var page = msgobj.page;
            posts.send_list(email, page, conn);
        } else if (type == 'new_comment') {
            var text = msgobj.text;
            var postid = msgobj.postid;
            posts.add_comment(email, postid, text, conn);
        } else if (type == 'like') {
            var postid = msgobj.postid;
            var value = msgobj.value;
            posts.like_unlike_post(email, postid, value, conn);
        } else if (type == 'validatetoken') {
            var msgobj = {};
            msgobj.type = 'tokenok';
            conn.send(JSON.stringify(msgobj));
        } else if (type == 'getpost') {
            var postid = msgobj.postid;
            posts.send_single_post(email, postid, conn);
        }
        // ========= PRIVILEGED MESSAGES ================
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
});