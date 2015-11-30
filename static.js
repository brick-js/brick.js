var brickStatic = require('./brick-static');
var debug = require('debug')('brick:static');
var http = require('./http');
var _ = require('lodash');
var bs;

function Static(config) {
    bs = brickStatic.Static({
        root: config.root,
        css: config.css,
        js: config.js
    });
}

Static.prototype.expressJs = function(req, res, next) {
    bs.js()
        .then(_.partial(http.send, res, 'application/javascript', 200))
        .catch(next);
};

Static.prototype.expressCss = function(req, res, next) {
    bs.css()
        .then(_.partial(http.send, res, 'text/css', 200))
        .catch(next);
};

module.exports = config => new Static(config);
