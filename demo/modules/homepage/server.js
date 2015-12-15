var User = require('../../models/user.js');
var debug = require('debug')('demo:homepage');

exports.url = ['/', '/homepage'];
exports.resolver = function(req, done, fail){
    done();
};
