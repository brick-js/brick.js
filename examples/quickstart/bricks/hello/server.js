exports.url = '/';
exports.view = function(req, done, fail){
    done({
        title: 'Hello World',
        content: 'This is my first brick!'
    });
};
