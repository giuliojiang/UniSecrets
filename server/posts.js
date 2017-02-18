var db = require( __dirname + '/db.js');
var session = require( __dirname + '/session.js');
var marked = require('marked');
var config = require(__dirname + '/config.js');
var mail = require(__dirname + '/mail.js');
var async = require('async');

var PAGE_MAX_POSTS = 20;

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
        
        db.connection.query('INSERT INTO `post`(`college`, `public`, `text`, `approved`) VALUES (?,?,?,?)', [college, is_public_int, text, 0], function(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            
            // Send confirmation
            var msgobj = {};
            msgobj.type = 'postsuccess';
            conn.send(JSON.stringify(msgobj));
            
            // Send email to admins
            for (var i = 0; i < config.admin_emails.length; i++) {
                var a_email = config.admin_emails[i];
                mail.sendEmail(a_email, "New post needs approval:\n" + text);
            }
        });
    });
    
};

var approve_post = function(accept, postid, conn) {
    if (accept == 1) {
        db.connection.query('UPDATE `post` SET `approved`= 1 WHERE `postid` = ?', [postid], function(error, results, fields) {
            if (error) {
                console.log(error);
                send_alert('Error', conn);
                return;
            }
            
            // send list of unapproved posts
            send_unapproved_posts(conn);
        });
    } else {
        db.connection.query('DELETE FROM `post` WHERE `postid` = ? AND `approved` = 0', [postid], function(error, results, fields) {
            if (error) {
                console.log(error);
                send_alert('Error', conn);
                return;
            }
            
            // Send list of unapproved posts
            send_unapproved_posts(conn);
        });
    }
};

var send_unapproved_posts = function(conn) {
    db.connection.query('SELECT `postid`, `college`, `text` FROM `post` WHERE `approved` = 0 LIMIT 20', [], function(error, results, fields) {
        if (error) {
            console.log(error);
            send_alert('Error', conn);
            return;
        }
        
        var msgobj = {};
        msgobj.type = 'unapproved_posts';
        msgobj.posts = [];
        for (var i = 0; i < results.length; i++) {
            var r = results[i];
            var p = {};
            p.postid = r.postid;
            p.college = r.college;
            p.text = marked(r.text);
            msgobj.posts.push(p);
        }
        conn.send(JSON.stringify(msgobj));
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

var isNumber = function(x) {
    return typeof x === 'number';
}

var send_list = function(email, page, conn) {
    if (!isNumber(page) || isNaN(page) || page < 0) {
        var msgobj = {};
        msgobj.type = 'page_not_found';
        conn.send(JSON.stringify(msgobj));
        return;
    }
    
    async.waterfall([

        function(callback) {
            
            db.connection.query('SELECT `college` FROM `user` WHERE `email` = ?', [email], function(error, results, fields) {
                if (error) {
                    callback(error);
                    return;
                }
                
                if (results.length != 1) {
                    callback("I was expecting 1 row");
                    return;
                }
                
                var college = results[0].college;
                var state = session.get_state(email);
                
                callback(null, college, state);
                return;
            });
            
        },
        function(college, state, callback) {
            
            db.connection.query('SELECT count(*) as thecount FROM   `post` WHERE   (`post`.`college` = ? OR `public` = 1) AND `post`.`approved` = 1;', [college], function(error, results, fields) {
                if (error) {
                    callback(error);
                    return;
                }
                
                var total_pages = Math.ceil(results[0].thecount / PAGE_MAX_POSTS);
                if (page >= total_pages) {
                    var msgobj = {};
                    msgobj.type = 'page_not_found';
                    conn.send(JSON.stringify(msgobj));
                    callback("requested too high page number");
                    return;
                } else {
                    callback(null, college, state);
                }
                
            });
            
        },
        function(college, state, callback) {
            
            db.connection.query('SELECT   `post`.`postid` AS postid,   `post`.`college` AS college,   (   SELECT     COUNT(*)   FROM     likes   WHERE     `likes`.`postid` = `post`.`postid` ) AS likes, post.`text` AS posttext, ( SELECT   COUNT(*) AS counter FROM   dislikes WHERE   `dislikes`.`postid` = `post`.`postid` ) AS dislikes, `comment`.text AS commenttext, `user`.`nickname` AS commentnickname FROM   `post` LEFT JOIN   `comment` ON post.postid = `comment`.postid LEFT JOIN   `user` ON `comment`.email = `user`.`email` WHERE   (`post`.`college` = ? OR `public` = 1) AND `post`.`approved` = 1 ORDER BY   `post`.`postid` DESC,   `comment`.commentid ASC', [college], function(error, results, fields) {
                if (error) {
                    callback(error);
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
                        postobj.text = marked(posttext);
                        postobj.likes = likes;
                        postobj.dislikes = dislikes;
                        postobj.college = acollege;
                        postobj.comments = [];
                        msgobj.posts.push(postobj);
                    }

                    if (commenttext && commentnickname) {
                        for (var j = 0; j < msgobj.posts.length; j++) {
                            if (msgobj.posts[j].id == postid) {
                                var commentobj = {};
                                commentobj.nickname = commentnickname;
                                commentobj.text = marked(commenttext);
                                msgobj.posts[j].comments.push(commentobj);
                            }
                        }
                    }
                }

                conn.send(JSON.stringify(msgobj));
                callback(null);
                return;
            });
            
        }
    ], function(err, result) {
        if (err) {
            console.log(err);
        }
    });

};

var send_single_post_update = function(email, postid, conn) {
    // Send single post update
    db.connection.query('SELECT   `post`.`postid` AS postid,   `post`.`college` AS college,   (   SELECT     COUNT(*)   FROM     likes   WHERE     likes.postid = `post`.postid ) AS likes, post.`text` AS posttext, ( SELECT   COUNT(*) FROM   dislikes WHERE   dislikes.postid = `post`.postid ) AS dislikes, `comment`.text AS commenttext, `user`.`nickname` AS commentnickname FROM   `post` LEFT JOIN   `comment` ON post.postid = `comment`.postid LEFT JOIN   `user` ON `comment`.email = `user`.`email` WHERE   (`post`.`postid` = ?) AND `post`.`approved` = 1 ORDER BY   `post`.`postid` DESC,   `comment`.commentid ASC', [postid], function(error, results, fields) {
        if (error) {
            console.log('Error when getting the updated comment ' + error);
            return;
        }
        
        var msgobj = {};
        msgobj.type = 'updatepost';
        msgobj.id = postid;
        msgobj.comments = [];
        
        for (var i = 0; i < results.length; i++) {
            msgobj.text = marked(results[i].posttext);
            msgobj.likes = results[i].likes;
            msgobj.dislikes = results[i].dislikes;
            msgobj.college = results[i].college;
            var commentnick = results[i].commentnickname;
            var commenttext = results[i].commenttext;
            if (commentnick && commenttext) {
                var commentobj = {};
                commentobj.nickname = commentnick;
                commentobj.text = marked(commenttext);
                msgobj.comments.push(commentobj);
            }
        }
        
        var state = session.get_state(email);
        state.visible_posts[postid] = true;
        conn.send(JSON.stringify(msgobj));
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
        
        send_single_post_update(email, postid, conn);

    });
};

var like_unlike_post = function(email, postid, value, conn) {
    if (value == 1) {
        // remove from dislikes
        db.connection.query('DELETE FROM `dislikes` WHERE postid = ? AND email = ?', [postid, email], function(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            
            // add to likes
            db.connection.query('INSERT INTO `likes`(`postid`, `email`) VALUES (?,?)', [postid, email], function(error, results, fields) {
                if (error) {
                    console.log(error);
                    return;
                }
                
                send_single_post_update(email, postid, conn);
            });
        });
        
    } else if (value == -1) {
        // remove from likes
        db.connection.query('DELETE FROM `likes` WHERE postid = ? AND email = ?', [postid, email], function(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            
            // add to dislikes
            db.connection.query('INSERT INTO `dislikes`(`postid`, `email`) VALUES (?,?)', [postid, email], function(error, results, fields) {
                if (error) {
                    console.log(error);
                    return;
                }
                
                send_single_post_update(email, postid, conn);
            });
        });
    } else {
        // remove from likes
        db.connection.query('DELETE FROM `likes` WHERE postid = ? AND email = ?', [postid, email], function(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            
            // remove from dislikes
            db.connection.query('DELETE FROM `dislikes` WHERE postid = ? AND email = ?', [postid, email], function(error, results, fields) {
                if (error) {
                    console.log(error);
                    return;
                }
                
                send_single_post_update(email, postid, conn);
            });
        });
    }

};

var send_single_post = function(email, postid, conn) {
    // Check that user has access to the post
    db.connection.query('SELECT   * FROM   `post` WHERE   `approved` = 1 AND `postid` = ? AND(     `public` = 1 OR `college` =(     SELECT       `user`.`college`     FROM       `user`     WHERE       `user`.`email` = ?   )   )', [postid, email], function(error, results, fields) {
        if (error) {
            console.log(error);
            var msgobj = {};
            msgobj.type = 'postnotfound';
            conn.send(JSON.stringify(msgobj));
            return;
        }
        
        if (results.length == 1) {
            send_single_post_update(email, postid, conn);
        } else {
            var msgobj = {};
            msgobj.type = 'postnotfound';
            conn.send(JSON.stringify(msgobj));
            return;
        }
    });
};

module.exports = {
    new_post: new_post,
    send_list: send_list,
    add_comment: add_comment,
    like_unlike_post: like_unlike_post,
    send_single_post: send_single_post,
    approve_post: approve_post,
    send_unapproved_posts: send_unapproved_posts
};