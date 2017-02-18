const _ = require('lodash');

exports.create = function(res, extend) {
    var response = {};

    return _.assign(res, extend);
};
