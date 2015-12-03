
exports.url = '/hello-world';

exports.resolver = function(req, done, fail){
    done({somebody: 'world'});
};

