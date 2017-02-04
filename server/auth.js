

// #############################################################################
// PASSWORD HASHING AND AUTHENTICATION
var passwordHash = require('password-hash');

var $auth = {};

$auth.add_user = function(email, nickname, college, password) {
    var hashed_password = passwordHash.generate(password);
    
    console.log('Hashed a password: ' + hashed_password);

    // Add user to user table
    connection.query('INSERT INTO `user`(`email`, `nickname`, `college`) VALUES (?,?,?)', [email, nickname, college], function (error, results, fields) {
        if (error) {
            console.log(error);
            return;
        }
        connection.query('INSERT INTO `authentication`(`email`, `hash`) VALUES (?,?)', [email, hashed_password], function(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            console.log('Successfully added account ' + email);
        });
    });
};