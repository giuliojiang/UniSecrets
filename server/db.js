// #############################################################################
// DATABASE PART
var mysql      = require('mysql');

var db_config = {
    host: 'localhost',
    user: 'UniSecrets',
    password: 'UniSecrets',
    database: 'UniSecrets'
};

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config);
    
    connection.connect(function(err) {
        if (err) {
            console.log('Error when connecting to database: ' + err);
            setTimeout(handleDisconnect, 2000);
        }
    });
    
    connection.on('error', function(err) {
        console.log('MySQL Database error: ' + err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        }
    });
};

handleDisconnect();

module.exports = {
    connection: connection
};

