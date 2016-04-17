const Module = require('../module/wmd');
const http = require('../io/http.js');
const Render = require('../module/render');
const debug = require('debug')('brick:app:error');

// catch 404 
exports.catch404 = function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
};

// customized error page
exports.errorPage = function(err, req, res, next) {
    debug('user defined error page')
    var mod = Module.get('error');
    if (!mod) return next(err); // apply default error handler

    mod.ctrl(req, {
            error: err
        })
        .then(html => Render.linkStatic(html))
        .then(html => http.html(res, html, err.status || 500))
        .catch(next);
};

// default error handler
exports.fallback = function(err, req, res, next) {
    console.error(err.stack || err);
    var html = `<pre><code>${err.stack}</code></pre>`;
    http.html(res, html, err.status || 500);
};

