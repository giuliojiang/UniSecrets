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