'use strict';

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render(__dirname + '/../tmp/index');
  });

  app.get('/activation', function(req, res) {
    res.render(__dirname + '/../tmp/activation');
  });

  app.get('/admin', function(req, res) {
    res.render(__dirname + '/../tmp/admin');
  });

  app.get('/dashboard', function(req, res) {
    res.render(__dirname + '/../tmp/dashboard');
  });

  app.get('/login', function(req, res) {
    res.render(__dirname + '/../tmp/login');
  });

  app.get('/new_post', function(req, res) {
    res.render(__dirname + '/../tmp/new_post');
  });

  app.get('/post', function(req, res) {
    res.render(__dirname + '/../tmp/post');
  });

  app.get('/register', function(req, res) {
    res.render(__dirname + '/../tmp/register');
  });

};
