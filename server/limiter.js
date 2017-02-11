/* THE LIMITER MODULE
 * 
 * This module has the aim of limiting the amount of interaction a user
 * can have over a period of time, to prevent users using javascript scripts
 * to inject a huge amount of data into the server.
 * 
 * It will also perform checks against user IP addresses to limit the number
 * of registration and login attempts
 * 
 * TIME FRAMES
 * 
 * There are 2 kinds of time frames that are used to check:
 * ticks -> 1 minute
 * tocks -> 1 hour
 * Some actions will be checked per tick, others per tock.
 * At each tick or tock the respective counters will be reset.

 * CONFIGURATION
 * 
 * This module reads configuration from UniSecrets/config/limiter.json
 * */



var get_client_address = function(conn) {
    return conn.upgradeReq.connection.remoteAddress;
};

var execute = function(conn, f) {
    f(function(err) {
        if (err) {
            // record an error
        } else {
            // record plain event
        }
    }
};