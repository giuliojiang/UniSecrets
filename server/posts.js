var db = require( __dirname + '/db.js');
var session = require( __dirname + '/session.js');
var marked = require('marked');
var config = require(__dirname + '/config.js');
var mail = require(__dirname + '/mail.js');
var async = require('async');

var PAGE_MAX_POSTS = 20;

var new_post = function(email, is_public, text, conn) {
    
    async.waterfall([
        
        // Get college
        function(callback) {
            db.users.find({
                email: email
            }, function(err, docs) {
                if (err) {
                    console.log(error);
                    return;
                }
                
                if (docs.length == 1) {
                    var college = docs[0].college;
                    callback(null, college);
                    return;
                } else {
                    callback('I was expecting 1 row');
                    return;
                }
            });
        },
        
        // insert
        function(college, callback) {
            var doc = {};
            doc.college = college;
            doc.public = is_public;
            doc.text = text;
            doc.likes = {};
            doc.dislikes = {};
            doc.time = new Date();
            doc.approved = false;
            
            db.posts.insert(doc, function(err, new_doc) {
                if (err) {
                    callback(err);
                } else {
                    console.log('Inserted: ' + JSON.stringify(new_doc));
                    callback(null);
                }
            });
        }

    ], function(err, result) {
        if (err) {
            console.log(err);
        } else {
            // Send confirmation
            var msgobj = {};
            msgobj.type = 'postsuccess';
            conn.send(JSON.stringify(msgobj));
            
            // Send email to admins
            for (var i = 0; i < config.admin_emails.length; i++) {
                var a_email = config.admin_emails[i];
                mail.sendEmail(a_email, "New post needs approval:\n" + text);
            }
        }
    });
    
};

var approve_post = function(accept, postid, conn) {
    if (accept == 1) {
        // update document
        db.posts.update({
            _id: postid
        },
        {
            $set: {
                approved: true
            }
        },
        {},
        function(err, num) {
            if (err) {
                console.log(err);
                send_alert('error', conn);
                return;
            } else {
                console.log('Updated ' + num + ' rows');
                send_unapproved_posts(conn);
            }
        });

    } else {
        // delete document
        db.remove({
            _id: postid
        },
        {},
        function(err, num) {
            if (err) {
                console.log(err);
                send_alert('error', conn);
                return;
            } else {
                console.log('Removed ' + num + ' rows');
                send_unapproved_posts(conn);
            }
        });

    }
};

var send_unapproved_posts = function(conn) {
    db.posts.find({
        approved: false
    })
    .limit(20)
    .exec(function(err, docs) {
        if (err) {
            console.log(err);
            send_alert('get unapproved posts error', conn);
            return;
        }
        
        var msgobj = {};
        msgobj.type = 'unapproved_posts';
        msgobj.posts = [];
        for (var i = 0; i < docs.length; i++) {
            var r = docs[i];
            var p = {};
            p.postid = r._id;
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

        // Get the user college and state
        function(callback) {
            
            db.users.find({
                email: email
            }, function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }
                
                if (docs.length != 1) {
                    callback("I was expecting 1 row");
                    return;
                }
                
                var college = docs[0].college;
                var state = session.get_state(email);
                
                callback(null, college, state);
                return;
            });
            
        },
        
        // check if requested page number is within bounds
        function(college, state, callback) {
            
            db.posts.count({
                $and: [
                    {
                        $or: [
                            {
                                college: college
                            },
                            {
                                "public": true
                            }
                        ]
                    },
                    {
                        approved: true
                    }
                ]

            }, function(err, count) {
                if (err) {
                    callback(err);
                    return;
                }
                
                var total_pages = Math.ceil(count / PAGE_MAX_POSTS);
                
                // Send update about total pages
                var msgobj = {};
                msgobj.type = 'total_pages';
                msgobj.maxp = total_pages;
                conn.send(JSON.stringify(msgobj));
                
                if (total_pages == 0 || page < total_pages) {
                    callback(null, college, state);
                    return;
                } else {
                    var msgobj = {};
                    msgobj.type = 'page_not_found';
                    conn.send(JSON.stringify(msgobj));
                    callback("requested too high page number");
                    return;
                }
            });

        },
        
        // get the relevant posts
        function(college, state, callback) {
            
            var pagelimit = PAGE_MAX_POSTS;
            var pageoffset = page * PAGE_MAX_POSTS;
            
            // TODO sort the list
            
            db.posts.find({
                $and: [
                    {
                        $or: [
                            {
                                college: college
                            },
                            {
                                "public": true
                            }
                        ]
                    },
                    {
                        approved: true
                    }
                ]

            }, function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }
                
                console.log('send_list got posts: ' + JSON.stringify(docs));
                
                var msgobj = {};
                
                msgobj.type = 'postlist';
                msgobj.posts = [];
                
                for (var i = 0; i < docs.length; i++) {
                    var d = docs[i];
                    var p = {};
                    
                    p.id = d._id;
                    p.text = d.text;
                    p.likes = Object.keys(d.likes).length;
                    p.dislikes = Object.keys(d.dislikes).length;
                    p.college = d.college;
                    msgobj.posts.push(p);

                }
                
                callback(null, msgobj);

                return;
            });
            
        },
        
        // populate the comments
        function(msgobj, callback) {
            console.log('send_list now populating comments');
            async.each(msgobj.posts, populate_comment, function(err) {
                if (err) {
                    callback(err);
                } else {
                    console.log('WS sending: ' + JSON.stringify(msgobj));
                    conn.send(JSON.stringify(msgobj));
                    callback(null);
                }
            });
        }
       
    ], function(err, result) {
        if (err) {
            console.log(err);
        }
    });

};

// p is a partially constructed post object in message 'postlist' or 'updatepost',
// and this function will populate its 'comments' field by querying the database
var populate_comment = function(p, callback) {
    var comments = [];
    
    db.comments.find({
        pid: p.id
    }, function(err, docs) {
        if (err) {
            callback(err);
            return;
        } else {
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];
                var a_comment = {};
                a_comment.nickname = doc.nickname;
                a_comment.text = doc.text;
                comments.push(a_comment);
            }
            p.comments = comments;
            callback(null);
            return;
        }
    });
}

var send_single_post_update = function(email, postid, conn) {
    db.posts.find({
        _id: postid,
        approved: true
    }, function(err, docs) {
        if (err) {
            console.log(err);
            return;
        }
        if (docs.length == 1) {
            var doc = docs[0];
            var msgobj = {};
            msgobj.type = 'updatepost';
            msgobj.id = doc._id;
            msgobj.text = marked(doc.text);
            msgobj.likes = Object.keys(doc.likes).length;
            msgobj.dislikes = Object.keys(doc.dislikes).length;
            msgobj.college = doc.college;
            populate_comment(msgobj, function(err) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    var state = session.get_state(email);
                    state.visible_posts[postid] = true;
                    conn.send(JSON.stringify(msgobj));
                    return;
                }
            });
        } else {
            console.log('I was expecting only 1 result in send_single_post_update');
            return;
        }
    });
    
};

var add_comment = function(email, postid, text, conn) {
    var state = session.get_state(email);
    if (!state.visible_posts[postid]) {
        console.log('User ' + email + ' has no access to post ' + postid);
        return;
    }
    
    async.waterfall([
        
        // get user's nickname
        function(callback) {
            db.users.find({
                email: email
            }, function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }
                
                if (docs.length == 1) {
                    var doc = docs[0];
                    var nickname = doc.nickname;
                    callback(null, nickname);
                    return;
                } else {
                    callback("Couldn't find user");
                    return;
                }
            });
        },
        
        // insert into database
        function(nickname, callback) {
            var doc = {};
            doc.pid = postid;
            doc.email = email;
            doc.nickname = nickname;
            doc.text = text;
            doc.time = new Date();
            db.comments.insert(doc, function(err, ndoc) {
                if (err) {
                    callback(err);
                    return;
                }
                console.log('Successfully inserted: ' + JSON.stringify(ndoc));
                callback(null);
                return;
            });
        }
        
    ], function(err, res) {
        if (err) {
            console.log(err);
        } else {
            send_single_post_update(email, postid, conn);
        }
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