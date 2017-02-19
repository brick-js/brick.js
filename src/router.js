var express = require('express');
var Render = require('./render.js');
var _ = require('lodash');
var debug = require('debug')('brick:router');
var http = require('./http');

function Router(config) {
    this.config = config;
    this.expressRouter = express.Router({
        mergeParams: true
    });
}

Router.prototype.express = function() {
    return this.expressRouter;
};

Router.prototype.expressCatch404 = function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
};

Router.prototype.expressErrorHandler = function(errorModule) {
    // customized error page
    return function(err, req, res, next) {
        debug('finding customized error page');
        if (!errorModule) return next(err); // apply default error handler

        debug('rendering customized error page');
        errorModule.render(req, res, {
                error: err
            })
            .then(html => http.html(res, html))
            .catch(next);
    };
};

Router.prototype.mountModules = function(modules) {
    modules.map(mod => this.mountModule(mod));
};

Router.prototype.mountModule = function(mod) {
    var router = mod.router;
    if (router.get) this.doMountModule(mod, 'get');
    if (router.put) this.doMountModule(mod, 'put');
    if (router.post) this.doMountModule(mod, 'post');
    if (router.delete) this.doMountModule(mod, 'delete');
};

Router.prototype.doMountModule = function(mod, method) {
    debug(`mounting ${mod.id} at ${method.toUpperCase()} ${mod.router.url}`);

    router = this.expressRouter[method].bind(this.expressRouter);
    router(mod.router.url, (req, res, next) => mod.render(req, res, {}, method)
        .then(html => {
            debug('module render complete', html && html.length);
            return html;
        })
        .then(html => http.html(res, html))
        .catch(err => next(err)));
};

module.exports = config => new Router(config);
