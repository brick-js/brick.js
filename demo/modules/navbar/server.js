var User = require('../../models/user.js');
var Cat = require('../../models/cat.js');

exports.resolver = function(req, done, fail){
    done({ user: User.current() });
};

