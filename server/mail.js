// #############################################################################
// MAIL PART

const nodemailer = require('nodemailer');
var signer = require('nodemailer-dkim').signer;

var fs = require('fs');

// Load configuration
var config_file = fs.readFileSync(__dirname + '/../config/server_config.json');
var config = JSON.parse(config_file);


var transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});

if (config.mail_use_dkim) {
    console.log('Setting up DKIM signature...');
    transporter.use('stream', require('nodemailer-dkim').signer({
        domainName: 'secrets.jstudios.ovh',
        keySelector: 'mail',
        privateKey: fs.readFileSync(config.mail_dkim_privkey)
    }));
}

var sendEmail = function(destination, content) {
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

module.exports = {
    sendEmail: sendEmail
};