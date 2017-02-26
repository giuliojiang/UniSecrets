var auth = require( __dirname + '/auth.js');
var posts = require(__dirname + '/posts.js');
var session = require( __dirname + '/session.js');
var limiter = require( __dirname + '/limiter.js');
var fs = require('fs');
var ws = require("ws");
var WebSocketServer = ws.Server;
var config = require(__dirname + '/config.js');

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
    }, processRequest).listen(config.ws_port);
} else {
    app = require('http').createServer(processRequest).listen(config.ws_port);
}

server = new WebSocketServer({server: app});

server.on('connection', function(conn) {
    console.log("New connection");
    conn.old_send = conn.send;
    conn.send = function(m) {
        try {
            conn.old_send(m);
        } catch (err) {
            console.log(err);
        }
    };
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
            limiter.execute(conn, conn, type, function(callback) {
                var email = msgobj.email;
                var password = msgobj.password;

                // try to authenticate
                auth.authenticate(email, password, conn, callback);
            });
            return;
        } else if (type == 'registration') {
            limiter.execute(conn, conn, type, function(callback) {
                var email = msgobj.email;
                var nickname = msgobj.nickname;
                var password = msgobj.password;

                auth.add_user(email, nickname, password, conn, callback);
            });
            return;
        } else if (type == 'activationcode') {
            limiter.execute(conn, conn, type, function(callback) {
                var email = msgobj.email;
                var code = msgobj.code;
                auth.activate_account(email, code, conn, callback);
            });
            return;
        } else if (type == 'addcollege') {
            var email = msgobj.email;
            var college = msgobj.college;
            auth.add_college(email, college, conn);
            return;
        } else if (type == 'homepage_list') {
            limiter.execute(conn, conn, type, function(callback) {
                posts.send_homepage_list(conn, callback);
            });
            return;
        }
        // ========= AUTHENTICATED MESSAGES ================
        else {
            // prevent brute-force token guessing
            if (limiter.limit_reached(conn, "generic_token_failure")) {
                console.log('WS: preventing brute force token guessing. Too many attempts already...');
                return;
            }
            
            email = session.validate_token(msgobj.user_token);
            if (!email) {
                session.send_login_first(conn);
                
                // dummy limiter failure
                limiter.execute(conn, conn, 'generic_token_failure', function(callback) {
                    callback('Token failure');
                });
                
                return;
            }
        }
        
        // All handlers after here require you to be logged in first!
            
        if (type == 'new_post') {
            limiter.execute(conn, email, type, function(callback) {
                var is_public = msgobj['public'];
                var text = msgobj.text;
                posts.new_post(email, is_public, text, conn);
            });
            return;
        } else if (type == 'requestposts') {
            var page = msgobj.page;
            posts.send_list(email, page, conn);
            return;
        } else if (type == 'new_comment') {
            limiter.execute(conn, email, type, function(callback) {
                var text = msgobj.text;
                var postid = msgobj.postid;
                posts.add_comment(email, postid, text, conn);
            });
            return;
        } else if (type == 'like') {
            var postid = msgobj.postid;
            var value = msgobj.value;
            posts.like_unlike_post(email, postid, value, conn);
            return;
        } else if (type == 'validatetoken') {
            var msgobj = {};
            msgobj.type = 'tokenok';
            conn.send(JSON.stringify(msgobj));
            return;
        } else if (type == 'getpost') {
            var postid = msgobj.postid;
            posts.send_single_post(email, postid, conn);
            return;
        }
        // ========= PRIVILEGED MESSAGES ================
        
        var is_admin = false;
        auth.is_user_admin(email, function(error, result) {
            if (error) {
                console.log(error);
                is_admin = false;
                return;
            }
            
            is_admin = result;
            
            if (is_admin) {
                if (type == 'pendingcollegeslist') {
                    auth.send_pending_colleges(conn);
                    return;
                } else if (type == 'pendingcollegeaction') {
                    var accept = msgobj.accept;
                    var college = msgobj.college;
                    var domain = msgobj.domain;
                    auth.college_action(accept, college, domain, conn);
                    return;
                } else if (type == 'get_unapproved_posts') {
                    posts.send_unapproved_posts(conn);
                    return;
                } else if (type == 'approve_post') {
                    var accept = msgobj.accept;
                    var postid = msgobj.postid;
                    posts.approve_post(accept, postid, conn);
                    return;
                }
            } else {
                console.log('Unrecognized or unauthorized message type ' + type);
            }
        });
    });
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    });
    conn.on('error', function(err) {
        console.log('WebSocket error: ' + err);
    });
});