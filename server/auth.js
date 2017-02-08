var db = require( __dirname + '/db.js');
var session = require( __dirname + '/session.js');
var randomstring = require("randomstring");
var mail = require( __dirname + '/mail.js');

// #############################################################################
// PASSWORD HASHING AND AUTHENTICATION
var passwordHash = require('password-hash');

var add_user = function(email, nickname, college, password, conn) {
    var hashed_password = passwordHash.generate(password);
    var activation_code = randomstring.generate(30);
    
    console.log('Hashed a password: ' + hashed_password);

    // Add user to user table
    db.connection.query('INSERT INTO `user`(`email`, `nickname`, `college`, `hash`, `activation`) VALUES (?,?,?,?,?)', [email, nickname, college, hashed_password, activation_code], function (error, results, fields) {
        if (error) {
            console.log(error);
            var msgobj = {};
            msgobj.type = 'alert';
            msgobj.msg = 'Registration failed. Was your email already used?';
            conn.send(JSON.stringify(msgobj));
            return;
        }
        console.log('Successfully added account ' + email + ' to database');
        
        // Send email to user
        var mailContent = 'Please activate your account at UniSecrets\n';
        mailContent += 'email: ' + email + '\n';
        mailContent += 'activation code: ' + activation_code + '\n';
        mail.sendEmail(email, mailContent);
        
        // Redirect user to the activation page
        var msgobj = {};
        msgobj.type = 'toactivation';
        conn.send(JSON.stringify(msgobj));

    });
};

var login_failed = function(email, conn) {
    console.log('Login failed for ' + email);

    var msgobj = {};
    msgobj.type = 'loginfail';
    conn.send(JSON.stringify(msgobj));
};

var login_success = function(email, conn) {
    console.log('Login success for ' + email);
    
    var new_token = session.make_token(email);
    
    var msgobj = {};
    msgobj.type = 'logintoken';
    msgobj.token = new_token;
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
                login_success(email, conn);
                return;
            }
        }
        login_failed(email, conn);
    });
};

var activate_account = function(email, code, conn) {
    // first check if the email with that code exist
    db.connection.query('SELECT * FROM `user` WHERE `email` = ? AND `activation` = ?', [email, code], function(error, results, fields) {
        if (error) {
            var msgobj = {};
            msgobj.type = 'alert';
            msgobj.msg = 'Activation failed.';
            conn.send(JSON.stringify(msgobj));
            return;
        }
        
        if (results.length != 1) {
            var msgobj = {};
            msgobj.type = 'alert';
            msgobj.msg = 'Activation failed.';
            conn.send(JSON.stringify(msgobj));
            return;
        }
        
        // now activate account on database
        db.connection.query('UPDATE `user` SET `activation`= NULL WHERE `email` = ?', [email], function(error, results, fields) {
            if (error) {
                var msgobj = {};
                msgobj.type = 'alert';
                msgobj.msg = 'Activation failed.';
                conn.send(JSON.stringify(msgobj));
                return;
            }
            
            console.log('Activated account ' + email);
            
            var msgobj = {};
            msgobj.type = 'activationsuccess';
            conn.send(JSON.stringify(msgobj));
        });
    });
    
    
    
    
};

module.exports = {
    authenticate: authenticate,
    add_user: add_user,
    activate_account: activate_account
};