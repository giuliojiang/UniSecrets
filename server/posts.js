var db = require( __dirname + '/db.js');
var session = require( __dirname + '/session.js');
var marked = require('marked');
var config = require(__dirname + '/config.js');
var mail = require(__dirname + '/mail.js');
var async = require('async');
var utils_safety = require(__dirname + "/utils_safety.js");
var utils_generic = require(__dirname + "/utils_generic.js");

var PAGE_MAX_POSTS = 20;

var new_post = function(email, is_public, text, conn) {
    
    async.waterfall([
    
        function(callback) {
            utils_safety.check_boolean(is_public, callback);
        },
        function(callback) {
            utils_safety.check_string(text, 4000, callback);
        },
        
        // Get college
        function(callback) {
            get_user_college(email, callback);
        },
        
        // insert
        function(college, callback) {
            var doc = {};
            doc.college = college;
            doc.ispublic = is_public;
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

var new_post_anon = function(text, conn, callback) {
    
    async.waterfall([
        
        function(callback) {
            utils_safety.check_string(text, 4000, callback);
        },
        
        // Insert document
        function(callback) {
            var doc = {};
            doc.college = null;
            doc.ispublic = true;
            doc.text = text;
            doc.likes = {};
            doc.dislikes = {};
            doc.time = new Date();
            doc.approved = false;
            
            db.posts.insert(doc, function(err, new_doc) {
                if (err) {
                    callback(err);
                    return;
                } else {
                    console.log("Inserted : " + JSON.stringify(new_doc));
                    callback(null);
                }
            });
        }
        
    ], function(err, res) {
        if (err) {
            callback(err);
            return;
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
            
            callback(null);
            return;
        }
    });

}

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
        db.posts.remove({
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

// callback(err, college)
var get_user_college = function(email, callback) {
    db.users.find({
        email: email
    }, function(err, docs) {
        if (err) {
            callback(err);
            return;
        }
        if (docs.length == 1) {
            var doc = docs[0];
            var college = doc.college;
            callback(null, college);
            return;
        } else {
            callback(utils_generic.make_error_trace("I was expecting 1 row"));
            return;
        }
    });
}

var send_list = function(email, page, conn) {
    

    if (!isNumber(page) || isNaN(page) || page < 0) {
        var msgobj = {};
        msgobj.type = 'page_not_found';
        conn.send(JSON.stringify(msgobj));
        return;
    }
    
    async.waterfall([

        // Get the user college
        function(callback) {
            get_user_college(email, callback);
        },
        
        // check if requested page number is within bounds
        function(college, callback) {
            
            db.posts.count({
                $and: [
                    {
                        $or: [
                            {
                                college: college
                            },
                            {
                                "ispublic": true
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
                    callback(null, college);
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
        function(college, callback) {
            
            var pagelimit = PAGE_MAX_POSTS;
            var pageoffset = page * PAGE_MAX_POSTS;
            
           
            db.posts.find({
                $and: [
                    {
                        $or: [
                            {
                                college: college
                            },
                            {
                                "ispublic": true
                            }
                        ]
                    },
                    {
                        approved: true
                    }
                ]

            })
            .sort({
                time: -1
            })
            .skip(pageoffset)
            .limit(pagelimit)
            .exec(function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }
                
                var msgobj = {};
                
                msgobj.type = 'postlist';
                msgobj.posts = [];
                
                for (var i = 0; i < docs.length; i++) {
                    var d = docs[i];
                    var p = {};
                    
                    p.id = d._id;
                    p.text = marked(d.text);
                    p.likes = Object.keys(d.likes).length;
                    p.dislikes = Object.keys(d.dislikes).length;
                    p.college = d.college;
                    if (!d.college) {
                        p.college = "secret";
                    }
                    msgobj.posts.push(p);

                }
                
                callback(null, msgobj);

                return;
            });
            
        },
        
        // populate the comments
        function(msgobj, callback) {
            async.each(msgobj.posts, populate_comment, function(err) {
                if (err) {
                    callback(err);
                } else {
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
    })
    .sort({
        time: 1
    })
    .exec(function(err, docs) {
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

    async.waterfall([
        
        // get user's nickname and college
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
                    var college = doc.college;
                    callback(null, nickname, college);
                    return;
                } else {
                    callback("Couldn't find user");
                    return;
                }
            });
        },
        
        // check if user can see this post
        function(nickname, college, callback) {
            db.posts.find({
                $or: [
                    {
                        _id: postid,
                        college: college,
                        approved: true
                    },
                    {
                        _id: postid,
                        "ispublic": true,
                        approved: true
                    }
                ]
            }, function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }
                if (docs.length == 1) {
                    callback(null, nickname);
                    return;
                } else {
                    callback('User has no access to post ' + postid);
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
            var college = doc.college;

            var dislikesDotEmail = "dislikes." + nickname;
            var likesDotEmail = "likes." + nickname;
            
            var dislikesObj = {};
            dislikesObj[dislikesDotEmail] = true;
            var likesObj = {};
            likesObj[likesDotEmail] = true;
            var bothObj = {};
            bothObj[likesDotEmail] = true;
            bothObj[dislikesDotEmail] = true;

            if (value == 1) {
                async.waterfall([
                    // unset dislike
                    function(callback) {
                        db.posts.update({
                            $or: [
                                {
                                    _id: postid,
                                    college: college,
                                    approved: true
                                },
                                {
                                    _id: postid,
                                    "ispublic": true,
                                    approved: true
                                }
                            ]
                        },
                        {
                            $unset: dislikesObj
                        },
                        {},
                        function(err, num) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            callback(null);
                        });
                    },
                    
                    // set like
                    function(callback) {
                        db.posts.update({
                            $or: [
                                {
                                    _id: postid,
                                    college: college,
                                    approved: true
                                },
                                {
                                    _id: postid,
                                    "ispublic": true,
                                    approved: true
                                }
                            ]
                        },
                        {
                            $set: likesObj
                        },
                        {},
                        function(err, num) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            callback(null);
                        });
                    }
                ], function(err, res) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    send_single_post_update(email, postid, conn);
                });
                
            } else if (value == -1) {
                async.waterfall([

                    // unset like
                    function(callback) {
                        db.posts.update({
                            $or: [
                                {
                                    _id: postid,
                                    college: college,
                                    approved: true
                                },
                                {
                                    _id: postid,
                                    "ispublic": true,
                                    approved: true
                                }
                            ]
                        },
                        {
                            $unset: likesObj
                        },
                        {},
                        function(err, num) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            callback(null);
                        });
                    },
                    
                    // set dislike
                    function(callback) {
                        db.posts.update({
                            $or: [
                                {
                                    _id: postid,
                                    college: college,
                                    approved: true
                                },
                                {
                                    _id: postid,
                                    "ispublic": true,
                                    approved: true
                                }
                            ]
                        },
                        {
                            $set: dislikesObj
                        },
                        {},
                        function(err, num) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            callback(null);
                        });
                    }
                ], function(err, res) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    send_single_post_update(email, postid, conn);
                });
            } else {
                async.waterfall([

                    // unset like and unlike
                    function(callback) {
                        db.posts.update({
                            $or: [
                                {
                                    _id: postid,
                                    college: college,
                                    approved: true
                                },
                                {
                                    _id: postid,
                                    "ispublic": true,
                                    approved: true
                                }
                            ]
                        },
                        {
                            $unset: bothObj
                        },
                        {},
                        function(err, num) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            callback(null);
                        });
                    }
                ], function(err, res) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    send_single_post_update(email, postid, conn);
                });
            }
            
        } else {
            callback("Unexpected number of results: " + docs.length);
            return;
        }
    });
    


};

var send_single_post = function(email, postid, conn) {
    async.waterfall([
        
        // get user's college
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
                    var college = doc.college;
                    callback(null, college);
                    return;
                } else {
                    callback('unexpected number of results: ' + docs.length);
                    return;
                }
            });
        },
        
        // get the post
        function(college, callback) {
            db.posts.find({
                college: college,
                _id: postid,
                approved: true
            }, function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }
                if (docs.length == 1) {
                    send_single_post_update(email, postid, conn);
                    callback(null);
                    return;
                } else {
                    var msgobj = {};
                    msgobj.type = 'postnotfound';
                    conn.send(JSON.stringify(msgobj));
                    callback('send_single_post: no post found');
                    return;
                }
            });
        }
        
    ], function(err, res) {
        if (err) {
            console.log(err);
        }
    });

};

var send_homepage_list = function(conn, callback) {

    async.waterfall([

        // get the relevant posts
        function(callback) {
            
            var pagelimit = PAGE_MAX_POSTS;

            db.posts.find({
                "ispublic": true,
                "approved": true
            })
            .sort({
                time: -1
            })
            .limit(pagelimit)
            .exec(function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }
                
                var msgobj = {};
                
                msgobj.type = 'homepage_post_list';
                msgobj.posts = [];
                
                for (var i = 0; i < docs.length; i++) {
                    var d = docs[i];
                    var p = {};
                    
                    p.id = d._id;
                    p.text = marked(d.text);
                    p.college = d.college;
                    if (!d.college) {
                        p.college = "secret";
                    }
                    msgobj.posts.push(p);

                }
                
                callback(null, msgobj);

                return;
            });
            
        }
       
    ], function(err, res) {
        if (err) {
            callback(err);
        } else {
            conn.send(JSON.stringify(res));
            callback(null);
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
    send_unapproved_posts: send_unapproved_posts,
    send_homepage_list: send_homepage_list,
    new_post_anon: new_post_anon
};