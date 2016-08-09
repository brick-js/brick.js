exports.url = '/';
exports.get = function(req, res){
    res.render({
        title: 'Hello World',
        content: 'This is my first brick!'
    });
};
