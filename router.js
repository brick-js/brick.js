var express = require('express');
var changeCase = require('change-case');
var Module = require('./module');
var Render = require('./render');
var _ = require('lodash');
var debug = require('debug')('brick:router');
var http = require('./http');

function Router(config) {
    this.config = config;
    this.expressRouter = express.Router();
}

Router.prototype.get = function(){
    return this.expressRouter;
};

Router.prototype.mountStatic = function(sttc){
    var cfg = this.config;
    debug('mounting static: ' + cfg.static.css.url + ', ' + cfg.static.js.url);
    this.expressRouter.use(sttc);
};

Router.prototype.mountModules = function(modules){
    _.forOwn(modules, this.mountModule, this);
};

Router.prototype.mountModule = function(mod){
    if (!mod.url) return;
    debug(`mounting ${mod.id} at ${mod.url}`);

    this.expressRouter.get(mod.url, (req, res, next) => mod.ctrl(req)
        .then(html => Render.shared().linkStatic(html))
        .then(_.partial(http.send, res, 'text/html', 200))
        .catch(next));
};

Router.prototype.mountErrorHandlers = function(){
    // catch 404 
    this.expressRouter.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // customized error page
    this.expressRouter.use(function(err, req, res, next) {
        var mod = Module.get('error');
        if(!mod) return next(err);  // apply default error handler

        mod.ctrl(req, {error: err})
            .then(html => Render.shared().linkStatic(html))
            .then(_.partial(http.send, res, 'text/html', err.status || 500))
            .catch(next);
    });

    // default error handler
    this.expressRouter.use(function(err, req, res, next) {
        console.error(err.stack || err);
        var html = `<pre><code>${err.stack}</code></pre>`;
        http.send(res, 'text/html', err.status || 500, html);
    });
};

module.exports = config => new Router(config);

