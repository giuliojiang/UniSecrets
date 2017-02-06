// #############################################################################
// DATABASE PART
var mysql      = require('mysql');

var pool = mysql.createPool({
    host : 'localhost',
    user : 'UniSecrets',
    password : 'UniSecrets',
    database: 'UniSecrets'
});

module.exports = {
    connection: pool
};

