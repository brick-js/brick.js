
exports.resolver = function(req, done, fail){
    var err = this.context.error;
    done({
        message: err.message.toUpperCase(),
        stack: err.stack
    });
};
