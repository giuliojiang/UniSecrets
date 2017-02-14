// #############################################################################
// MAIL PART

const nodemailer = require('nodemailer');
var signer = require('nodemailer-dkim').signer;
var fs = require('fs');
var config = require(__dirname + '/config.js');

var transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});

if (config.mail_use_dkim) {
    console.log('Setting up DKIM signature...');
    transporter.use('stream', require('nodemailer-dkim').signer({
        domainName: config.email_hostname,
        keySelector: config.mail_dkim_selector,
        privateKey: fs.readFileSync(config.mail_dkim_privkey)
    }));
}

var sendEmail = function(destination, content) {
    var mailOptions = {
        from: '"Uni Secrets" <account@'+ config.email_hostname +'>', // sender address
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

module.exports = {
    sendEmail: sendEmail
};
