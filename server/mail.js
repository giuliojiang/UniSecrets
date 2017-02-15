// #############################################################################
// MAIL PART

const nodemailer = require('nodemailer');
var signer = require('nodemailer-dkim').signer;
var fs = require('fs');
var config = require(__dirname + '/config.js');

var transporter = null;

if (!config.mail_debug_mode) {
    transporter = nodemailer.createTransport({
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail'
    });
} else {
    console.log('Starting mail module in DEBUG mode');
}

if (!config.mail_debug_mode && config.mail_use_dkim) {
    console.log('Setting up DKIM signature...');
    transporter.use('stream', require('nodemailer-dkim').signer({
        domainName: config.email_hostname,
        keySelector: config.mail_dkim_selector,
        privateKey: fs.readFileSync(config.mail_dkim_privkey)
    }));
}

var sendEmail = function(destination, content) {
    if (config.mail_debug_mode) {
        
        console.log('MAIL DEBUG MODE');
        console.log('Sending mail to ' + destination);
        console.log(content);
        
    } else {
    
        var mailOptions = {
            from: '"Uni Secrets" <account@'+ config.email_hostname +'>', // sender address
            to: destination, // list of receivers
            subject: 'Uni Secrets', // Subject line
            html: content // body
        };
        
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
        
    }
};

module.exports = {
    sendEmail: sendEmail
};
