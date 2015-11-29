var User = require('../../models/user.js');
var debug = require('debug')('demo:user-list');

exports.resolver = function(req, done, fail){
    debug('enter view controller');
    done({ users: User.query() });
};
