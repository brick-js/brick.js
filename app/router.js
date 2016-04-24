var express = require('express');
var Module = require('../module/wmd.js');
var Render = require('../module/render');
var _ = require('lodash');
var debug = require('debug')('brick:router');
var http = require('../io/http');

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
    var count = 0;
    _.forOwn(modules, mod => {
        if(this.mountModule(mod)) count++;
    });
    debug(`${count}/${modules.length} modules mounted`);
};

Router.prototype.mountModule = function(mod){
    if (!mod.url) return false;
    debug(`mounting ${mod.id} at ${mod.url}`);

    var jsUrl = this.config.static.js.url;
    var cssUrl = this.config.static.css.url;

    this.expressRouter.get(mod.url, (req, res, next) => mod.ctrl(req)
        .then(html => Render.linkStatic(html, jsUrl, cssUrl))
        .then(_.partial(http.send, res, 'text/html', 200))
        .catch(next));
    return true;
};

Router.prototype.mountErrorHandlers = function(){
    var jsUrl = this.config.static.js.url;
    var cssUrl = this.config.static.css.url;

    this.expressRouter.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // customized error page
    this.expressRouter.use(function(err, req, res, next) {
        debug('user defined error page');
        var mod = Module.get('error');
        if (!mod) return next(err); // apply default error handler

        mod.ctrl(req, {
                error: err
            })
            .then(html => Render.linkStatic(html, jsUrl, cssUrl))
            .then(html => http.html(res, html, err.status || 500))
            .catch(next);
    });

    // default error handler
    this.expressRouter.use(function(err, req, res, next) {
        console.error(err.stack || err);
        var html = `<pre><code>${err.stack}</code></pre>`;
        http.html(res, html, err.status || 500);
    });
};

module.exports = config => new Router(config);

