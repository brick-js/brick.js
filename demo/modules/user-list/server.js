var User = require('../../models/user.js');
var debug = require('debug')('demo:user-list');

exports.view = function(req, res, next){
    debug('enter view controller');
    res.render({
        users: User.query()
    });
};
