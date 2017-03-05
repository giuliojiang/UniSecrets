var utils_generic = require(__dirname + "/utils_generic.js");

var check_string = function(s, maxlength, callback) {
    if (typeof s === 'string' || s instanceof String) {
        if (maxlength && s.length > maxlength) {
            callback(utils_generic.make_error_trace("Maximum length exceeded"));
            return;
        } else {
            callback(null);
            return;
        }
    } else {
        callback(utils_generic.make_error_trace("Not a string"));
        return;
    }
}

var check_boolean = function(b, callback) {
    if (typeof(b) === "boolean") {
        callback(null);
    } else {
        callback(utils_generic.make_error_trace("Not a boolean"));
    }
}

module.exports = {
    check_string: check_string,
    check_boolean: check_boolean
};