exports.url = '/';

exports.get = function(req, res, next){
    res.render({
        title: 'Hello World'
    });
};
