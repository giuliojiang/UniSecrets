var db = require( __dirname + '/db.js');
var session = require( __dirname + '/session.js');
var randomstring = require("randomstring");
var mail = require( __dirname + '/mail.js');
var fs = require('fs');
var config = require(__dirname + '/config.js');
var async = require('async');
var utils_safety = require(__dirname + "/utils_safety.js");
var utils_generic = require(__dirname + "/utils_generic.js");

var generate_web_address = function() {
    var protocol_stem = config.use_ssl ? 'https' : 'http';
    var hostname = config.hostname;
    var port = undefined;
    
    if (config.use_ssl) {
        if (config.https_port == 443) {
            port = '';
        } else {
            port = ':' + config.https_port;
        }
    } else {
        if (config.http_port == 80) {
            port = '';
        } else {
            port = ':' + config.http_port;
        }
    }
    
    // https://secrets.jstudios.ovh:1234
    return protocol_stem + '://' + hostname + port;
}

var generate_activation_hash = function(email, code) {
    return '#' + email + ';' + code;
};

var generate_link_to = function(addr) {
    return '<a href="'+ addr +'">'+ addr +'</a>';
};

// #############################################################################
// PASSWORD HASHING AND AUTHENTICATION
var passwordHash = require('password-hash');

var send_alert = function(msg, conn) {
    if (!conn) {
        console.log('send_alert was called without conn!');
        var err = new Error();
        console.log(err.stack);
        return;
    }
    
    var msgobj = {};
    msgobj.type = 'alert';
    msgobj.msg = msg;
    conn.send(JSON.stringify(msgobj));
    return;
}

var is_string = function(s) {
    return typeof s === 'string' || s instanceof String;
}

var nickname_valid = function(nick) {
    if (!is_string(nick)) {
        return false;
    }
    var whitelist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0, len = nick.length; i < len; i++) {
        var a_char = nick[i];
        if (!(whitelist.indexOf(a_char) > -1)) {
            // not contains
            return false;
        }
    }
    return true;
}

var email_valid = function(email) {
    if (!is_string(email)) {
        return false;
    }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

var college_valid = function(college) {
    if (!is_string(college)) {
        return false;
    }
    var whitelist = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '";
    for (var i = 0, len = college.length; i < len; i++) {
        var a_char = college[i];
        if (!(whitelist.indexOf(a_char) > -1)) {
            // not contains
            return false;
        }
    }
    return true;
}

var add_user = function(email, nickname, password, conn, callback) {
    var hashed_password = passwordHash.generate(password);
    var activation_code = randomstring.generate(30);
    
    // Split the email's domain
    if (!email_valid(email)) {
        send_alert('Registration failed. Email invalid', conn);
        callback('Registration failed. Email invalid');
        return;
    }
    var email_domain = undefined;
    var email_split = email.split('@');
    if (email_split.length == 2) {
        email_domain = email_split[1];
    } else {
        send_alert('Registration failed (0). Email invalid', conn);
        callback('Registration failed (0). Email invalid');
        return;
    }
    
    async.waterfall([
        // Check if college domain is valid
        function(callback) {
            db.colleges.find({
                domain: email_domain,
                active: true
            }, function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }
                
                if (docs.length == 1) {
                    var the_doc = docs[0];
                    var college_name = the_doc.college;
                    callback(null, college_name);
                    return;
                } else {
                    console.log('No college found for email ' + email);
                    var msgobj = {};
                    msgobj.type = 'collegenotfound';
                    conn.send(JSON.stringify(msgobj));
                    callback("College not found");
                    return;
                }
            });
        },
        
        // Check if email or nickname have already been used
        function(college_name, callback) {
            if (!nickname_valid(nickname)) {
                send_alert('Nicknames can only contain letters and numbers', conn);
                callback('Nicknames can only contain letters and numbers');
                return;
            }
            
            if (!email_valid(email)) {
                send_alert('Invalid email address', conn);
                callback('Invalid email address');
                return;
            }
            
            db.users.find({
                $or: [
                    {
                        email: email
                    },
                    {
                        nickname: nickname
                    }
                ]
            }, function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }
                
                if (docs.length == 0) {
                    console.log('No duplicate users found. Proceeding with registration');
                    callback(null, college_name);
                    return;
                } else {
                    send_alert('Registration failed (3). Was your email already used?', conn);
                    callback('Found '+ docs.length +' users with existing emails or nickanmes');
                    return;
                }
            });
        },
        
        // Insert into database the new user
        function(college_name, callback) {
            var doc = {};
            doc.email = email;
            doc.nickname = nickname;
            doc.college = college_name;
            doc.hash = hashed_password;
            doc.activation = activation_code;
            doc.moderator = false;
            
            db.users.insert(doc, function(err, newDoc) {
                if (err) {
                    callback(err);
                    return;
                } else {
                    console.log('New document inserted: ' + JSON.stringify(newDoc));
                    
                    // Send email to user
                    var mailContent = '<p>Please activate your account at UniSecrets</p>\n';
                    mailContent += generate_link_to(generate_web_address() + '/activation'+ generate_activation_hash(email, activation_code));
                    mail.sendEmail(email, mailContent);
                    
                    // Redirect user to the activation page
                    var msgobj = {};
                    msgobj.type = 'toactivation';
                    conn.send(JSON.stringify(msgobj));
                    
                    callback(null);
                    return;
                }
            });
        }
    ], function(err, result) {
        if (err) {
            callback(err); // Limiter's callback
        }
    });

};

var login_failed = function(email, conn) {
    console.log('Login failed for ' + email);

    var msgobj = {};
    msgobj.type = 'loginfail';
    conn.send(JSON.stringify(msgobj));
};

var login_success = function(email, is_admin, conn) {
    console.log('Login success for ' + email);
    
    var new_token = session.make_token(email);
    
    var msgobj = {};
    msgobj.type = 'logintoken';
    msgobj.token = new_token;
    msgobj.admin = is_admin ? 1 : 0;
    conn.send(JSON.stringify(msgobj));
    
    
};

var authenticate = function(email, password, conn, callback) {
    
    // Get user document
    db.users.find({
        email: email,
        activation: null
    }, function(err, docs) {
        if (err) {
            login_failed(email, conn);
            callback(error);
            return;
        }
        
        if (docs.length == 1) {
            var hashed_password = docs[0]['hash'];
            if (passwordHash.verify(password, hashed_password)) {
                login_success(email, docs[0]['moderator'], conn);
                callback(null);
                return;
            } else {
                login_failed(email, conn);
                callback('Login failed. Password not matching');
                return;
            }
        } else {
            login_failed(email, conn);
            callback('Login failed. Found ' + docs.length + ' docs');
        }
    });
    
};

var activate_account = function(email, code, conn, autologin, callback) { 
    
    async.waterfall([
        
        // get user document
        function(callback) {
            db.users.find({
                email: email,
                activation: code
            }, function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }
                
                if (docs.length == 1) {
                    var docid = docs[0]._id;
                    callback(null, docid);
                    return;
                } else {
                    send_alert('Activation failed', conn);
                    callback('Activation failed');
                    return;
                }
            });
        },
        
        // activate the user (update)
        function(docid, callback) {
            console.log('Trying to update document: ' + docid);
            db.users.update({
                _id: docid
            },
            {
                $set: {
                    activation: null
                }
            },
            {},
            function(err, num) {
                if (err) {
                    send_alert('Activation failed', conn);
                    callback(err);
                    return;
                } else {
                    console.log('Replaced ' + num + ' entries');
                    
                    var msgobj = {};
                    msgobj.type = 'activationsuccess';
                    conn.send(JSON.stringify(msgobj));
                    
                    // Automatically log in the user
                    if (autologin) {
                        login_success(email, false, conn); // new users cannot be admins!
                    }
                    
                    callback(null);
                    return;
                }
            });
        }
        
    ], function(err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
    
};

var activate_account_unconditioned = function(email, callback) {
    async.waterfall([
        
        // activate the user (update)
        function(callback) {
            db.users.update({
                "email": email
            },
            {
                $set: {
                    "activation": null
                }
            },
            {},
            function(err, num) {
                if (err) {
                    callback(err);
                    return;
                } else {
                    console.log('Replaced ' + num + ' entries');
                    callback(null);
                    return;
                }
            });
        }
        
    ], function(err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

var split_email_domain = function(email) {
    // check that it's a valid email
    var email_split = email.split('@');
    if (email_split.length != 2 || !email_valid(email)) {
        return null;
    }
    var email_domain = email_split[1];
}

var add_college = function(email, college, conn, callback) { 
    
    // email checks
    
    // check that it's a valid email
    var email_domain = split_email_domain(email);
    if (!email_domain) {
        var m = 'Your email address is not valid';
        send_alert(m, conn);
        callback(utils_generic.make_error_trace(m));
        return;
    }
    
    // Check college name
    if (!college_valid(college)) {
        var m = 'Only letters, numbers and single-quotes allowed in college name';
        send_alert(m, conn);
        callback(utils_generic.make_error_trace(m));
        return;
    }
    
    async.waterfall([
    
        // check if domain is already in database
        function(callback) {
            db.colleges.find({
                domain: email_domain
            }, function(err, docs) {
                if (err) {
                    callback(err);
                    return;
                }
                
                if (docs.length == 0) {
                    // College isn't in db yet
                    callback(null);
                } else {
                    send_alert('Your college was already in the database.', conn);
                    callback('College already present');
                    return;
                }
            });
        },
        
        // insert in database
        function(callback) {
            var doc = {
                college: college,
                domain: email_domain,
                active: config.auto_enable_emails
            }
            
            db.colleges.insert(doc, function(err, newDoc) {
                if (err) {
                    callback(err);
                    return;
                } else {
                    console.log('Successfully inserted doc in colleges: ' + JSON.stringify(newDoc));
                    send_alert('Thank you for your request', conn);
                    callback(null);
                    return;
                }
            });
        }
    
    
    ], callback);

};

var is_user_admin = function(email, callback) { 
    
    db.users.find({
        email: email,
        moderator: true
    }, function(err, docs) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, docs.length == 1);
        }
    });

};

var send_pending_colleges = function(conn) { 
    
    db.colleges.find({
        active: false
    }, function(err, docs) {
        if (err) {
            console.log(err);
            send_alert('Could not retrieve pending colleges', conn);
            return;
        }
        
        var msgobj = {};
        msgobj.type = 'pendingcollegelist';
        msgobj.colleges = [];
        for (var i = 0; i < docs.length; i++) {
            var collegeobj = {};
            collegeobj.college = docs[i].college;
            collegeobj.domain = docs[i].domain;
            msgobj.colleges.push(collegeobj);
        }
        conn.send(JSON.stringify(msgobj));
    });

};

var college_action = function(accept, college, domain, conn, callback) { 
    
    if (accept == 1) {
        // update the college/domain to have active=true
        db.colleges.update({
            college: college,
            domain: domain
        }, {
            $set: {
                active: true
            }
        },
        {},
        function(err, num) {
            if (err) {
                callback(err);
                return;
            }
            
            console.log('Updated ' + num + ' rows');
            send_pending_colleges(conn);
            callback(null);
        });
    } else {
        db.colleges.remove({
            college: college,
            domain: domain
        },
        {},
        function(err, num) {
            if (err) {
                callback(err);
                return;
            }
            
            console.log('Removed ' + num + ' rows');
            send_pending_colleges(conn);
            callback(null);
        });
    }
    
};

var make_user_admin = function(email, conn, callback) {
    db.users.update({
        email: email
    },
    {
        $set: {
                moderator: true
        }
    },
    {},
    function(err, num) {
        if (err) {
            send_alert("Could not set to admin", conn);
            callback(err);
            return;
        } else {
            console.log('Updated ' + num + ' rows');
            callback(null);
            return;
        }
    });
};

var first_time_setup_user = function(username, email, college, password, conn) {
    async.waterfall([
        // check that db is indeed empty
        function(callback) {
            db.is_empty(function(err, empty) {
                if (err) {
                    callback(err);
                    return;
                }
                if (empty) {
                    callback(null);
                } else {
                    callback(utils_generic.make_error_trace("Unauthorized first time setup"));
                }
            });
        },
        
        // check arguments
        function(callback) {
            if (!nickname_valid(username)) {
                var m = "Invalid username. Only alphanumeric characters allowed";
                send_alert(m, conn);
                callback(utils_generic.make_error_trace(m));
                return;
            }
            if (!email_valid(email)) {
                var m = "Invalid email";
                send_alert(m, conn);
                callback(utils_generic.make_error_trace(m));
                return;
            }
            if (!college_valid(college)) {
                var m = "College name not valid. Only alphanumeric characters and single quote allowed";
                send_alert(m, conn);
                callback(utils_generic.make_error_trace(m));
                return;
            }
            callback(null);
            return;
        },
        
        // add college
        function(callback) {
            add_college(email, college, conn, function(err, res) {
                if (err) {
                    callback(err);
                    return;
                }
                console.log("First time setup: added college");
                callback(null);
            });
        },
        
        // enable college
        function(callback) {
            college_action(1, college, split_email_domain(email), conn, function(err, res) {
                if (err) {
                    callback(err);
                    return;
                }
                console.log("First time setup: activated college");
                callback(null);
            });
        },
        
        // add user
        function(callback) {
            add_user(email, username, password, conn, function(err, res) {
                if (err) {
                    callback(err);
                    return;
                }
                console.log("First time setup: added user");
                callback(null);
            });
        },

        // activate user
        function(callback) {
            activate_account_unconditioned(email, function(err, res) {
                if (err) {
                    callback(err);
                    return;
                }
                console.log("First time setup: activated user account");
                callback(null);
            });
        },
        
        // make user admin
        function(callback) {
            make_user_admin(email, conn, function(err, res) {
                if (err) {
                    callback(err);
                    return;
                }
                console.log("First time setup: made user admin");
                callback(null);
            });
        },
        
        
        // redirect to login page
        function(callback) {
            var msgobj = {};
            msgobj.type = "goto";
            msgobj.where = "/login",
            msgobj.premsg = "Setup successful. Redirecting to login...";
            conn.send(JSON.stringify(msgobj));
            callback(null);
        }
        

    ], function(err, res) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("Successfully completed first time setup");
    });
};

module.exports = {
    authenticate: authenticate,
    add_user: add_user,
    activate_account: activate_account,
    add_college: add_college,
    is_user_admin: is_user_admin,
    send_pending_colleges: send_pending_colleges,
    college_action: college_action,
    send_alert: send_alert,
    make_user_admin: make_user_admin,
    first_time_setup_user: first_time_setup_user
};