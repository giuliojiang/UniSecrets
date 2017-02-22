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
    postid
    college
    public
    text
    comments: [
        {email, text}
    ]
    likes: [
        {email}
    ]
    dislikes: [
        {email}
    ]
    time
}
*/
db.posts = new Datastore({
    filename:  __dirname + '/../db/posts.db',
    autoload: true});
db.posts.persistence.setAutocompactionInterval(3600 * 1000);



module.exports = db;