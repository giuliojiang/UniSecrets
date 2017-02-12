/* 
 
 THE LIMITER MODULE
 
 This module has the aim of limiting the amount of interaction a user
 can have over a period of time, to prevent users using javascript scripts
 to inject a huge amount of data into the server.
 
 It will also perform checks against user IP addresses to limit the number
 of registration and login attempts
 
 TIME FRAMES
 
 There are 2 kinds of time frames that are used to check:
 ticks -> 1 minute
 tocks -> 1 hour
 Some actions will be checked per tick, others per tock.
 At each tick or tock the respective counters will be reset.

 CONFIGURATION
 
 This module reads configuration from UniSecrets/config/limiter.json
 Each type has 4 parameters:
 - locality
 - timeframe
 - sensitivity
 - limit
 
 EXECUTE
 
 Execute takes a function f to be executed.
 It will execute the function f with a callback used to signal
 if the operation was successful.
 
 RECORDS OBJECT
 
 It's a map of this format
    type ->
        (identification -> count)
 identification is either user IP address or username

 */

// "login": ["ip", "tick", "error", 3],

var fs = require('fs');
var auth = require( __dirname + '/auth.js');

// Load configuration
var config_file = fs.readFileSync(__dirname + '/../config/server_config.json');
var config = JSON.parse(config_file);
var rules_file = fs.readFileSync(__dirname + '/../config/limiter.json');
var rules = JSON.parse(rules_file);

var records = {};

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
};

// INITIALIZING the records ####################################################
for (var property in rules) {
    if (rules.hasOwnProperty(property)) {
        // Check that the rule is correctly set
        if (rules[property] && rules[property].constructor === Array && rules[property].length == 4) {
            var a_rule = rules[property];
            var p_locality = a_rule[0];
            var p_timeframe = a_rule[1];
            var p_sensitivity = a_rule[2];
            var p_limit = a_rule[3];
            
            if (!(p_locality == 'ip' || p_locality == 'user')) {
                throw 'FATAL: LIMITER rule ['+ property +'][locality] must be "ip" or "user"';
            }
            
            if (!(p_timeframe == 'tick' || p_timeframe == 'tock')) {
                throw 'FATAL: LIMITER rule ['+ property +'][timeframe] must be "tick" or "tock"';
            }
            
            if (!(p_sensitivity == 'error' || p_sensitivity == 'count')) {
                throw 'FATAL: LIMITER rule ['+ property +'][sensitivity] must be "error" or "count"';
            }
            
            if (!isInt(p_limit)) {
                throw 'FATAL: LIMITER rule ['+ property +'][limit] must be an integer';
            }
            
            records[property] = {};
        } else {
            throw "FATAL: LIMITER rule ["+ property +"] is not set correctly";
        }
        

    }
}

// TIME BASED record refresh ###################################################
var minutes = 0;
setInterval(function() {
    console.log(JSON.stringify(records, null, 2));
    
    minutes += 1;
    reset_ticks();
    if (minutes == 60) {
        minutes = 0;
        reset_tocks();
    }
}, 1000 * 60); // Every 1 minute

var reset_ticks = function() {
    for (var property in rules) {
        if (rules.hasOwnProperty(property)) {
            // Check that the rule is correctly set
            var a_rule = rules[property];
            var p_timeframe = a_rule[1];
            if (p_timeframe == 'tick') {
                records[property] = {};
            }
        }
    }
};

var reset_tocks = function() {
    for (var property in rules) {
        if (rules.hasOwnProperty(property)) {
            // Check that the rule is correctly set
            var a_rule = rules[property];
            var p_timeframe = a_rule[1];
            if (p_timeframe == 'tock') {
                records[property] = {};
            }
        }
    }
};


// INCREMENTING counters #######################################################
var get_client_address = function(conn) {
    return conn.upgradeReq.connection.remoteAddress.toString();
};

var reset_record = function(type) {
    records[type] = {};
};

var increment_count = function(ident, type) {
    var type_settings = rules[type];
    if (!type_settings) {
        console.log('LIMITER rule ['+ type +'] has no settings associated');
        return;
    }
    
    var a_rule = rules[type];
    var p_locality = a_rule[0];
    var p_sensitivity = a_rule[2];
    
    var identifier = ident;
    
    // Ignore if sensitivity is 'error'
    if (p_sensitivity != 'count') {
        return;
    }
    
    // Get ws client IP address
    if (p_locality == 'ip') {
        identifier = get_client_address(ident);
    }
    
    // Increment the counter
    if (!records[type]) {
        records[type] = {};
    }
    
    if (!records[type][identifier]) {
        records[type][identifier] = 0;
    }
    
    records[type][identifier] += 1;
};

var increment_error = function(ident, type) {
    var type_settings = rules[type];
    if (!type_settings) {
        console.log('LIMITER rule ['+ type +'] has no settings associated');
        return;
    }
    
    var a_rule = rules[type];
    var p_locality = a_rule[0];
    var p_sensitivity = a_rule[2];
    
    var identifier = ident;
    
    // Ignore if sensitivity is 'error'
    if (p_sensitivity != 'error') {
        return;
    }
    
    // Get ws client IP address
    if (p_locality == 'ip') {
        identifier = get_client_address(ident);
    }
    
    // Increment the counter
    if (!records[type]) {
        records[type] = {};
    }
    
    if (!records[type][identifier]) {
        records[type][identifier] = 0;
    }
    
    records[type][identifier] += 1;
};

var limit_reached = function(ident, type) {
    var type_settings = rules[type];
    if (!type_settings) {
        console.log('LIMITER rule ['+ type +'] has no settings associated');
        return;
    }
    
    var a_rule = rules[type];
    var p_locality = a_rule[0];
    var p_sensitivity = a_rule[2];
    var p_limit = a_rule[3];
    
    var identifier = ident;

    // Get ws client IP address
    if (p_locality == 'ip') {
        identifier = get_client_address(ident);
    }
    
    if (!records[type]) {
        return false;
    }
    
    if (!records[type][identifier]) {
        return false;
    }
    
    return records[type][identifier] > p_limit;
};

// EXECUTION ###################################################################
var execute = function(conn, ident, type, f) {
    // increment standard counter
    increment_count(ident, type);
    
    if (limit_reached(ident, type)) {
        console.log('LIMITER [' + type  +'] reached! Blocking...');
        auth.send_alert('Too many '+ type +' attempts', conn);
        // And the function f will not be executed
    } else {
        try {
            f(function(err) {
                if (err) {
                    // record an error
                    console.log('LIMITER ['+ type +'] finished with err=' + err);
                    increment_error(ident, type);
                } else {
                    // record plain event
                    console.log('LIMITER ['+ type +'] finished with success');
                }
            });
        } catch (exc) {
            console.log('LIMITER ['+ type +'] crashed with exception:');
            console.log(exc);
            increment_error(ident, type);
        }
    }
};

module.exports = {
    execute: execute
};