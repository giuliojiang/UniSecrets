'use strict';

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

  app.get('/post', function(req, res) {
    res.render(__dirname + '/../static/post');
  });

  app.get('/register', function(req, res) {
    res.render(__dirname + '/../static/register');
  });

};
