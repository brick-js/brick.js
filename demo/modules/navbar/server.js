var User = require('../../models/user.js');
var Cat = require('../../models/cat.js');

exports.view = function(req, res, next){
    res.render({
        user: User.current()
    });
};

