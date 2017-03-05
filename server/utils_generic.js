var make_error_trace = function(msg) {
    var err = new Error();
    return msg + "\n" + err.stack;
}

module.exports = {
    make_error_trace: make_error_trace
}