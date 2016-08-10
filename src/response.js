const _ = require('lodash');
const methods = ['append', 'attachment', 'cookie', 'clearCookie', 'download', 'end', 'format', 'get', 'json', 'jsonp', 'links', 'location', 'redirect', 'render', 'send', 'sendFile', 'sendStatus', 'set', 'status', 'type', 'vary'];

exports.create = function(res, extend) {
    var response = {};

    methods.forEach(function(name) {
        var method;
        if (method = res[name]) {
            response[name] = function() {
                method.apply(res, arguments);
                return response;
            };
        }
    });

    return _.assign(response, extend);
};
