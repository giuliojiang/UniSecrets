

// #############################################################################
// HTTP PART
var fs = require('fs');
var http = require('http');
var https = require('https');

// Load configuration
var config_file = fs.readFileSync(__dirname + '/../config/server_config.json');
var config = JSON.parse(config_file);

var express = require('express');
var app = express();

app.use('/', express.static(__dirname + '/../tmp'));

if (config.use_ssl) {
    console.log('SSL enabled. Loading certificates...');
    var privateKey = fs.readFileSync(config.ssl_privkey);
    var certificate = fs.readFileSync(config.ssl_certificate);
    
    var credentials = {
        key: privateKey,
        cert: certificate
    };
    
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(443, function() {
        console.log('HTTPS server listening on port 443');
    }).on('error', function(err) {
        console.log(err);
    });
} else {
    var httpServer = http.createServer(app);
    httpServer.listen(8080, function() {
        console.log('HTTP server listening on port 8080');
    }).on('error', function(err) {
        console.log(err);
    });
}
