var User = require('../../models/user.js');
var Cat = require('../../models/cat.js');
var debug = require('debug')('demo:default');

exports.resolver = function(req, done, fail){
    done({ title: 'Brick.js Demo' });
};
