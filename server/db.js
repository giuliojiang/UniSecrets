// #############################################################################
// DATABASE PART
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'UniSecrets',
  password : 'UniSecrets',
  database : 'UniSecrets'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    if (results[0].solution == 2) {
        console.log('Database connection successful.');
    }
});