var User = require('../../models/user.js');
var Cat = require('../../models/cat.js');
var debug = require('debug')('demo:homepage');

exports.url = ['/', '/homepage'];
exports.view = function(req, res, next){
    debug('enter view controller');
    res.render({
        title: 'Brick.js Demo'
    });
};
