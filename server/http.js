

// #############################################################################
// HTTP PART
var fs = require('fs');
var http = require('http');
var https = require('https');
var config = require(__dirname + '/config.js');
var express = require('express');
var routes = require(__dirname + '/routes.js');
var app = express();

var http_port = config.http_port;
var https_port = config.https_port;

app.use('/', express.static(__dirname + '/../tmp'));
app.set('view engine', 'ejs');

routes(app);

if (config.use_ssl) {
    console.log('SSL enabled. Loading certificates...');
    var privateKey = fs.readFileSync(config.ssl_privkey);
    var certificate = fs.readFileSync(config.ssl_certificate);
    
    var credentials = {
        key: privateKey,
        cert: certificate
    };
    
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(https_port, function() {
        console.log('HTTPS server listening on port ' + https_port);
    }).on('error', function(err) {
        console.log(err);
    });
} else {
    var httpServer = http.createServer(app);
    httpServer.listen(http_port, function() {
        console.log('HTTP server listening on port ' + http_port);
    }).on('error', function(err) {
        console.log(err);
    });
}

module.exports = {
    app: app
};
