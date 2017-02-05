var db = require( __dirname + '/db.js');
var session = require( __dirname + '/session.js');


var new_post = function(email, is_public, text, conn) {

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
        
        db.connection.query('INSERT INTO `post`(`college`, `public`, `likes`, `text`, `dislikes`) VALUES (?,?,?,?,?)', [college, is_public_int, 0, text,0], function(error, results, fields) {
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

var list_contains_postid = function(thelist, postid) {
    for (var i = 0; i < thelist.length; i++) {
        if (thelist[i].id == postid) {
            return true;
        }
    }
    return false;
}

var send_list = function(email, page, conn) {
    // get the college of this user
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
        
        var state = session.get_state(email);
        
        db.connection.query('SELECT  `post`.`postid` AS postid, `post`.`college` AS college,   `likes` AS likes,   post.`text` AS posttext,   `dislikes` AS dislikes,   `comment`.text AS commenttext,   `user`.`nickname` AS commentnickname FROM   `post` LEFT JOIN   `comment` ON post.postid = `comment`.postid LEFT JOIN   `user` ON `comment`.email = `user`.`email` WHERE   `post`.`college` = ? OR `public` = 1 ORDER BY `post`.`postid` DESC, `comment`.commentid ASC', [college], function(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            
            if (!results) {
                results = [];
            }
            
            var msgobj = {};
            
            msgobj.type = 'postlist';
            
            msgobj.posts = [];
            
            for (var i = 0; i < results.length; i++) {
                var postid = results[i].postid;
                var acollege = results[i].college;
                var likes = results[i].likes;
                var posttext = results[i].posttext;
                var dislikes = results[i].dislikes;
                var commenttext = results[i].commenttext;
                var commentnickname = results[i].commentnickname;
                
                state.visible_posts[postid] = true;
                
                if (!list_contains_postid(msgobj.posts, postid)) {
                    var postobj = {};
                    postobj.id = postid;
                    postobj.text = posttext;
                    postobj.likes = likes;
                    postobj.dislikes = dislikes;
                    postobj.college = acollege;
                    postobj.comments = [];
                    msgobj.posts.push(postobj);
                }
                
                console.log('comments: ' + commentnickname + ' ' + commenttext);

                if (commenttext && commentnickname) {
                    console.log('valid. Trying to find ' + postid);
                    for (var j = 0; j < msgobj.posts.length; j++) {
                        console.log('This is ' + msgobj.posts[j].id);
                        if (msgobj.posts[j].id == postid) {
                            console.log('found');
                            var commentobj = {};
                            commentobj.nickname = commentnickname;
                            commentobj.text = commenttext;
                            msgobj.posts[j].comments.push(commentobj);
                        }
                    }
                }
            }
            
            console.log(JSON.stringify(msgobj));
            
            conn.sendText(JSON.stringify(msgobj));

        });
    });
};

var add_comment = function(email, postid, text, conn) {
    var state = session.get_state(email);
    if (!state.visible_posts[postid]) {
        console.log('User ' + email + ' has no access to post ' + postid);
        return;
    }
    
    db.connection.query('INSERT INTO `comment`(`postid`, `email`, `text`) VALUES (?,?,?)', [postid, email, text], function(error, results, fields) {
        if (error) {
            console.log('Error when inserting a comment ' + error);
            return;
        }
        
        console.log('Successfully inserted a comment: ' + text);
        
        // Send single post update
        db.connection.query('SELECT   `post`.`postid` AS postid,   `post`.`college` AS college,   `likes` AS likes,   post.`text` AS posttext,   `dislikes` AS dislikes,   `comment`.text AS commenttext,   `user`.`nickname` AS commentnickname FROM   `post` LEFT JOIN   `comment` ON post.postid = `comment`.postid LEFT JOIN   `user` ON `comment`.email = `user`.`email` WHERE   `post`.`postid` = ? OR `public` = 1 ORDER BY   `post`.`postid` DESC,   `comment`.commentid ASC', [postid], function(error, results, fields) {
            if (error) {
                console.log('Error when getting the updated comment ' + error);
                return;
            }
            
            var msgobj = {};
            msgobj.type = 'updatepost';
            msgobj.id = postid;
            msgobj.comments = [];
            
            for (var i = 0; i < results.length; i++) {
                msgobj.text = results[i].posttext;
                msgobj.likes = results[i].likes;
                msgobj.dislikes = results[i].dislikes;
                msgobj.college = results[i].college;
                var commentnick = results[i].commentnickname;
                var commenttext = results[i].commenttext;
                if (commentnick && commenttext) {
                    var commentobj = {};
                    commentobj.nickname = commentnick;
                    commentobj.text = commenttext;
                    msgobj.comments.push(commentobj);
                }
            }
            
            conn.sendText(JSON.stringify(msgobj));
        });

    });
};

module.exports = {
    new_post: new_post,
    send_list: send_list,
    add_comment: add_comment
};