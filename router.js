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
    debug('mounting static: ' + cfg.css.url + ',' + cfg.js.url);

    this.expressRouter.get(cfg.js.url, sttc.expressJs);
    this.expressRouter.get(cfg.css.url, sttc.expressCss);
    return this;
};

Router.prototype.mountModules = function(modules){
    _.forOwn(modules, this.mountModule, this);
    return this;
};

Router.prototype.mountModule = function(mod){
    if (!mod.url) return;
    debug(`mounting ${mod.name}: ${mod.url}`);

    this.expressRouter.get(mod.url, (req, res, next) => mod.ctrl(req)
        .then(html => Render.shared().linkStatic(html))
        .then(_.partial(http.send, res, 'text/html', 200))
        .catch(next)
    );
};

Router.prototype.errorHandlers = function(){
    // catch 404 
    this.expressRouter.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers
    this.expressRouter.use(function(err, req, res, next) {
        debug(err.stack);

        var mod = Module.get('error');
        mod.ctrl(req, {error: err})
            .then(html => Render.shared().linkStatic(html))
            .then(_.partial(http.send, res, 'text/html', err.status || 500))
            .catch(function(e){
                debug('untreated error');
                debug(e);
            });
    });
};

module.exports = config => new Router(config);

