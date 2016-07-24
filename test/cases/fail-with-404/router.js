exports.get = function(req, res, next){
    var e = new Error('Not Found');
    e.status = 404;
    next(e);
};
