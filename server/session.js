var randomstring = require("randomstring");

var generate_token = function() {
    return randomstring.generate(30);
}

var user_token = {};

var token_user = {};

var user_state = {};

var make_token = function(email) {
    var existing_token = user_token[email];
    if (existing_token) {
        delete token_user[existing_token];
    }
    
    var new_token = generate_token();
    
    user_token[email] = new_token;
    token_user[new_token] = email;
    
    return new_token;
};

module.exports = {
    make_token: make_token
};