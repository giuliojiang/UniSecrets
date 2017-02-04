var db = require( __dirname + '/db.js');
var session = require( __dirname + '/session.js');


var new_post = function(token, is_public, text, conn) {
    // check if user is logged in
    var email = session.validate_token(token);
    if (!email) {
        session.send_login_first(conn);
        return;
    }
    
    // post(K postid, college, public, likes, text)
    
    // find the college
    db.connection.query('SELECT `college` FROM `user` WHERE `email` = ?', [email], function(error, results, fields) {
        if (error) {
            console.log(error);
            return;
        }
        
        if (results.length != 1) {
            console.log("I was expecting 1 row");
            return;
        }
        
        var college = results[0].college;
        
        var is_public_int = is_public ? 1 : 0;
        
        db.connection.query('INSERT INTO `post`(`college`, `public`, `likes`, `text`) VALUES (?,?,?,?)', [college, is_public_int, 0, text], function(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            console.log('Successfully inserted post: ' + text);
            
            // Send confirmation
            var msgobj = {};
            msgobj.type = 'postsuccess';
            conn.sendText(JSON.stringify(msgobj));
        });
    });
    
};

module.exports = {
    new_post: new_post
};