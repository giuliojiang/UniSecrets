// #############################################################################
// DATABASE PART

var Datastore = require('nedb');
var path = require('path');

var db = {};

/*
USERS
{
    email
    nickname
    college
    hash
    activation
    moderator?
}
*/
db.users = new Datastore({
    filename:  __dirname + '/../db/users.db',
    autoload: true});
db.users.persistence.setAutocompactionInterval(3600 * 1000);

/*
COLLEGES
{
    college
    domain
    active?
}
*/
db.colleges = new Datastore({
    filename:  __dirname + '/../db/colleges.db',
    autoload: true});
db.colleges.persistence.setAutocompactionInterval(3600 * 1000);

/*
POSTS
{
    college
    ispublic
    text
    likes: {
        nickname: true
    }
    dislikes: {
        nickname: true
    }
    time
    approved?
}
*/
db.posts = new Datastore({
    filename:  __dirname + '/../db/posts.db',
    autoload: true});
db.posts.persistence.setAutocompactionInterval(3600 * 1000);

/*
COMMENTS
{
    pid
    email
    nickname
    text
    time
}
*/
db.comments = new Datastore({
    filename:  __dirname + '/../db/comments.db',
    autoload: true});
db.comments.persistence.setAutocompactionInterval(3600 * 1000);

module.exports = db;