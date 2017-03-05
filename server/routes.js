'use strict';

var db = require( __dirname + '/db.js');

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render(__dirname + '/../static/index');
    });

    app.get('/activation', function(req, res) {
        res.render(__dirname + '/../static/activation');
    });

    app.get('/admin', function(req, res) {
        res.render(__dirname + '/../static/admin');
    });

    app.get('/dashboard', function(req, res) {
        res.render(__dirname + '/../static/dashboard');
    });

    app.get('/login', function(req, res) {
        res.render(__dirname + '/../static/login');
    });

    app.get('/new_post', function(req, res) {
        res.render(__dirname + '/../static/new_post');
    });

    app.get('/new_post_anon', function(req, res) {
        res.render(__dirname + '/../static/new_post_anon');
    });

    app.get('/post', function(req, res) {
        res.render(__dirname + '/../static/post');
    });

    app.get('/register', function(req, res) {
        res.render(__dirname + '/../static/register');
    });

    app.get('/firsttimesetup', function(req, res) {
        db.is_empty(function(err, empty) {
            if (err) {
                console.log(err);
                return;
            }
            if (empty) {
                res.render(__dirname + '/../static/firsttimesetup');
                return;
            }
        });
    });

};
