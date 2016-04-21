var express = require('express');
var Module = require('../module/wmd.js');
var Render = require('../module/render');
var _ = require('lodash');
var debug = require('debug')('brick:router');
var http = require('../io/http');
var errorHandler = require('./error');

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
    this.expressRouter.use(errorHandler.catch404);
    this.expressRouter.use(errorHandler.errorPage);
    this.expressRouter.use(errorHandler.fallback);
};

module.exports = config => new Router(config);

