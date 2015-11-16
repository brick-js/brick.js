var brickStatic = require('./brick-static');
var debug = require('debug')('brick:static');
var bs;

function Static(config){
    bs = brickStatic.Static({
        root: config.root,
        css: config.css,
        js: config.js
    });
}

Static.prototype.expressJs = function(req, res, next){
    bs.js()
        .then(function(js){
            res
                .set('Content-Type', 'application/javascript')
                .status(200)
                .end(new Buffer(js));
        })
        .catch(next);
};

Static.prototype.expressCss = function(req, res, next){
    bs.css()
        .then(function(css){
            res
                .set('Content-Type', 'text/css')
                .status(200)
                .end(new Buffer(css));
        })
        .catch(next);
};

exports.Static = function(config){
    return new Static(config);
};

