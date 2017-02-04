// #############################################################################
// MAIL PART

var $mail = {};

const nodemailer = require('nodemailer');
var signer = require('nodemailer-dkim').signer;

var fs = require('fs');

var transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});

transporter.use('stream', require('nodemailer-dkim').signer({
    domainName: 'secrets.jstudios.ovh',
    keySelector: 'mail',
    privateKey: fs.readFileSync('/opt/UniSecrets/mail.private')
}));

$mail.sendEmail = function(destination, content) {
    var mailOptions = {
        from: '"Uni Secrets" <account@secrets.jstudios.ovh>', // sender address
        to: destination, // list of receivers
        subject: 'Uni Secrets', // Subject line
        text: content // plain text body
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
};

// #############################################################################
// HTTP PART
var express = require('express');
var app = express();

app.use('/', express.static(__dirname + '/../static'));

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
});

// #############################################################################
// DATABASE PART
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'UniSecrets',
  password : 'UniSecrets',
  database : 'UniSecrets'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    if (results[0].solution == 2) {
        console.log('Database connection successful.');
    }
});

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

// TEST
$auth.add_user('gj414@ic.ac.uk', 'gj', 'Imperial College London', 'ciaociao');

// #############################################################################
// WEBSOCKET PART
var ws = require("nodejs-websocket")
 
// Scream server example: "hi" -> "HI!!!" 
var server = ws.createServer(function (conn) {
    console.log("New connection")
    conn.on("text", function (str) {
        console.log("Received "+str)
        conn.sendText(str.toUpperCase()+"!!!")
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })
}).listen(8001);