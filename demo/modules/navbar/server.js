var User = require('../../models/user.js');

exports.resolver = function(req, done, fail){
    done({ user: User.current() });
};

