var readline = require('readline');
var async = require('async');
var auth = require( __dirname + '/auth.js');

var rl = readline.createInterface({
    input:process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', function(line) {
    auth.make_user_admin(line, {
        send: function(msg) {
            console.log('msg: ' + msg);
        }
    });
});