// #############################################################################
// MAIL PART

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

// setup email data with unicode symbols
let mailOptions = {
    from: '"Uni Secrets" <account@secrets.jstudios.ovh>', // sender address
    to: 'giuliojiang@gmail.com', // list of receivers
    subject: 'Uni Secrets account activation', // Subject line
    text: 'You activation code is 1234' // plain text body
};

// send mail with defined transport object
// transporter.sendMail(mailOptions, function(error, info) {
//     if (error) {
//         return console.log(error);
//     }
//     console.log('Message %s sent: %s', info.messageId, info.response);
// });

// #############################################################################
// HTTP PART
var express = require('express');
var app = express();

app.use('/', express.static(__dirname + '/../static'));

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
});

// #############################################################################
// WEBSOCKET PART