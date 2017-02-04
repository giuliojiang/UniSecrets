var db = require( __dirname + '/db.js');
var session = require( __dirname + '/session.js');

// #############################################################################
// PASSWORD HASHING AND AUTHENTICATION
var passwordHash = require('password-hash');

var add_user = function(email, nickname, college, password) {
    var hashed_password = passwordHash.generate(password);
    
    console.log('Hashed a password: ' + hashed_password);

    // Add user to user table
    db.connection.query('INSERT INTO `user`(`email`, `nickname`, `college`) VALUES (?,?,?)', [email, nickname, college], function (error, results, fields) {
        if (error) {
            console.log(error);
            return;
        }
        db.connection.query('INSERT INTO `authentication`(`email`, `hash`) VALUES (?,?)', [email, hashed_password], function(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            console.log('Successfully added account ' + email);
        });
    });
};

var login_failed = function(email, conn) {
    console.log('Login failed for ' + email);

    var msgobj = {};
    msgobj.type = 'loginfail';
    conn.sendText(JSON.stringify(msgobj));
};

var login_success = function(email, conn) {
    console.log('Login success for ' + email);
    
    var new_token = session.make_token(email);
    
    var msgobj = {};
    msgobj.type = 'logintoken';
    msgobj.token = new_token;
    conn.sendText(JSON.stringify(msgobj));
};

var authenticate = function(email, password, conn) {
    // passwordHash.verify('Password0', hashedPassword)
    
    // Get the hashed password from database
    db.connection.query('SELECT `hash` FROM `authentication` WHERE `email` = ?', [email], function(error, results, fields) {
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

module.exports = {
    authenticate: authenticate,
    add_user: add_user
};