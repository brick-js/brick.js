var debug = require('debug')('ec:error');

exports.resolver = function(req, done, fail){
    var err = this.context.error;
    debug(err.stack || err);
    done({
        message: err.message.toUpperCase(),
        stack: err.stack
    });
};
