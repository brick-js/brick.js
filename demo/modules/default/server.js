var User = require('../../models/user.js');
var debug = require('debug')('demo:default');

exports.resolver = function(req, done, fail){
    done({ title: 'Brick.js Demo' });
};
