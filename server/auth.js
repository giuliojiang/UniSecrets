var db = require( __dirname + '/db.js');
var session = require( __dirname + '/session.js');
var randomstring = require("randomstring");
var mail = require( __dirname + '/mail.js');
var fs = require('fs');

// Load configuration
var config_file = fs.readFileSync(__dirname + '/../config/server_config.json');
var config = JSON.parse(config_file);

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

// #############################################################################
// PASSWORD HASHING AND AUTHENTICATION
var passwordHash = require('password-hash');

var send_alert = function(msg, conn) {
    var msgobj = {};
    msgobj.type = 'alert';
    msgobj.msg = msg;
    conn.send(JSON.stringify(msgobj));
    return;
}

var add_user = function(email, nickname, password, conn) {
    var hashed_password = passwordHash.generate(password);
    var activation_code = randomstring.generate(30);
    
    // Split the email's domain
    var email_domain = undefined;
    var email_split = email.split('@');
    if (email_split.length == 2) {
        email_domain = email_split[1];
    } else {
        send_alert('Registration failed (0). Email invalid', conn);
        return;
    }
    
    db.connection.query('SELECT `college` FROM `college` WHERE `domain` = ?', [email_domain], function(error, results, fields) {
        if (error) {
            console.log(error);
            send_alert('Registration failed (1)', conn);
            return;
        }
        
        if (results.length == 0) {
            console.log('No college found for email ' + email);
            var msgobj = {};
            msgobj.type = 'collegenotfound';
            conn.send(JSON.stringify(msgobj));
            return;
        }
        
        if (results.length != 1) {
            console.log('Unexpected results length ' + results.length);
            send_alert('Registration failed (2)', conn);
            return;
        }
    
        var college = results[0].college;
        
        console.log('Hashed a password: ' + hashed_password);

        // Add user to user table
        db.connection.query('INSERT INTO `user`(`email`, `nickname`, `college`, `hash`, `activation`) VALUES (?,?,?,?,?)', [email, nickname, college, hashed_password, activation_code], function (error, results, fields) {
            if (error) {
                console.log(error);
                send_alert('Registration failed (3). Was your email already used?', conn);
                return;
            }
            console.log('Successfully added account ' + email + ' to database');

            // Send email to user
            var mailContent = 'Please activate your account at UniSecrets\n';
            mailContent += 'email: ' + email + '\n';
            mailContent += 'activation code: ' + activation_code + '\n';
            mailContent += generate_web_address() + '/activation.html\n';
            mail.sendEmail(email, mailContent);
            
            // Redirect user to the activation page
            var msgobj = {};
            msgobj.type = 'toactivation';
            conn.send(JSON.stringify(msgobj));

        });
        
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

var authenticate = function(email, password, conn) {
    // passwordHash.verify('Password0', hashedPassword)
    
    // Get the hashed password from database
    db.connection.query('SELECT `hash` FROM `user` WHERE `email` = ? AND `activation` IS NULL', [email], function(error, results, fields) {
        if (error) {
            console.log(error);
            login_failed(email, conn);
            return;
        }
        if (results.length == 1) {
            var hashed_password = results[0]['hash'];
            if (passwordHash.verify(password, hashed_password)) {
                
                // Check if user is admin or not
                db.connection.query('SELECT `email` FROM `moderator` WHERE `email` = ?', [email], function(error, results, fields) {
                    if (error) {
                        console.log(error);
                        login_failed(email, conn);
                        return;
                    }
                    if (results.length == 0) {
                        // not an admin
                        login_success(email, false, conn);
                    } else if (results.length == 1) {
                        // is an admin
                        login_success(email, true, conn);
                    } else {
                        // impossible!
                        console.log('Unexpected result length of ' + results.length);
                        login_failed(email, conn);
                    }
                    return;
                });
            }
        } else {
            login_failed(email, conn);
        }
    });
};

var activate_account = function(email, code, conn) {
    // first check if the email with that code exist
    db.connection.query('SELECT * FROM `user` WHERE `email` = ? AND `activation` = ?', [email, code], function(error, results, fields) {
        if (error) {
            send_alert('Activation failed', conn);
            return;
        }
        
        if (results.length != 1) {
            send_alert('Activation failed.', conn);
            return;
        }
        
        // now activate account on database
        db.connection.query('UPDATE `user` SET `activation`= NULL WHERE `email` = ?', [email], function(error, results, fields) {
            if (error) {
                send_alert('Activation failed', conn);
                return;
            }
            
            console.log('Activated account ' + email);
            
            var msgobj = {};
            msgobj.type = 'activationsuccess';
            conn.send(JSON.stringify(msgobj));
        });
    });
    
};

var add_college = function(email, college, conn) {
    // email checks
    
    // check that it's a valid email
    var email_split = email.split('@');
    if (email_split.length != 2) {
        send_alert('Your email address is not valid', conn);
        return;
    }
    var email_domain = email_split[1];
    
    // Check that email is .ac.uk
    if (!email_domain.endsWith('.ac.uk')) {
        send_alert('Your email address must end with .ac.uk', conn);
        return;
    }
    
    // Check that the database doesn't already contain this
    db.connection.query('SELECT `college`, `domain` FROM `college` WHERE `domain` = ?', [email_domain], function(error, results, fields) {
        if (error) {
            console.log(error);
            send_alert('Could not process your request', conn);
            return;
        }
        
        if (results.length == 1) {
            send_alert('Your college is already recognized by the system. Please register or log in', conn);
            return;
        }
        
        if (results.length > 1) {
            console.log('Error. Unexpected result length of ' + results.length);
            send_alert('Could not process your request', conn);
            return;
        }
        
        // Insert in the database
        db.connection.query('INSERT INTO `pendingcollege`(`college`, `domain`) VALUES (?,?)', [college, email_domain], function(error, results, fields) {
            if (error) {
                console.log(error);
                send_alert('A request for your college was already sent', conn);
                return;
            }
            
            console.log('Added college request for ' + email_domain);
            send_alert('Thank you for your request', conn);
            return;
        });
    });
};

var is_user_admin = function(email, callback) {
    db.connection.query('SELECT * FROM `moderator` WHERE `email` = ?', [email], function(error, results, fields) {
        if (error) {
            console.log(error);
            callback(undefined, false);
            return;
        }
        
        callback(undefined, results.length == 1);
    });
};

var send_pending_colleges = function(conn) {
    db.connection.query('SELECT * FROM `pendingcollege`', [], function(error, results, fields) {
        if (error) {
            console.log(error);
            send_alert('Could not retrieve pending colleges');
            return;
        }
        
        var msgobj = {};
        msgobj.type = 'pendingcollegelist';
        msgobj.colleges = [];
        for (var i = 0; i < results.length; i++) {
            var collegeobj = {};
            collegeobj.college = results[i].college;
            collegeobj.domain = results[i].domain;
            msgobj.colleges.push(collegeobj);
        }
        conn.send(JSON.stringify(msgobj));
    });

};

var college_action = function(accept, college, domain, conn) {
    if (accept == 1) {
        db.connection.query('INSERT INTO `college`(`college`, `domain`) VALUES (?,?)', [college, domain], function(error, results, fields) {
            if (error) {
                console.log(error);
                send_alert('An error occurred');
                return;
            }
            
            db.connection.query('DELETE FROM `pendingcollege` WHERE `college` = ? AND `domain` = ?', [college, domain], function(error, results, fields) {
                if (error) {
                    console.log(error);
                    send_alert('An error occurred');
                    return;
                }
                
                send_pending_colleges(conn);
            });
        });
    } else {
        db.connection.query('DELETE FROM `pendingcollege` WHERE `college` = ? AND `domain` = ?', [college, domain], function(error, results, fields) {
            if (error) {
                console.log(error);
                send_alert('An error occurred');
                return;
            }
            
            send_pending_colleges(conn);
        });
    }
};

module.exports = {
    authenticate: authenticate,
    add_user: add_user,
    activate_account: activate_account,
    add_college: add_college,
    is_user_admin: is_user_admin,
    send_pending_colleges: send_pending_colleges,
    college_action: college_action
};