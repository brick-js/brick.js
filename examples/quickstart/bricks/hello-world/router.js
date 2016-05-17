exports.url = '/';
exports.get = function(req, done, fail){
    done({
        title: 'Hello World',
        content: 'This is my first brick!'
    });
};
