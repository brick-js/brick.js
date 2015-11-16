var express = require('express');
var changeCase = require('change-case');
var Module = require('./module');
var render = require('./render');
var _ = require('lodash');
var debug = require('debug')('brick:router');
var sttc = require('./static');

function Router(config) {
    this.config = config;
    this.router = express.Router();
    this.renderer = render.Render(config);
    this.mountStatic();
}

Router.prototype.mountStatic = function(){
    var config = this.config,
        static = sttc.Static(config);

    debug('mounting static: ' + config.css.url + ',' + config.js.url);
    this.router.get(config.css.url, static.expressCss);
    this.router.get(config.js.url, static.expressJs);
};

Router.prototype.mountModules = function(modules) {
    _.forOwn(modules, this.mountModule, this);
    return this.router;
};

Router.prototype.mountModule = function(mod) {
    if (!mod.url || !mod.view) return ;
    debug('mounting ' + mod.name + ': ' + mod.url);

    var router = this.router,
        renderer = this.renderer;
    router.get(mod.url, function(req, res, next) {
        // do render & send
        res.render = function(locals) {
            locals.brk = {
                render: function(mid, locals) {
                    var mod = Module.get(changeCase.camelCase(mid));
                    if (!mod) {
                        var e = new Error('module ' + mid + ' not found');
                        return Promise.reject(e);
                    }
                    var backtrace = res.locals;
                    res.locals = _.defaults(locals, res.locals);
                    var p = renderer.render(mod, req, res, next);
                    res.locals = backtrace;
                    return p;
                }
            };
            _.extend(res.locals, locals);
            renderer
                .doRender(mod, req, res, next)
                .then(function(html){
                    return renderer.addStatic(html);
                })
                .then(function(html) {
                    res
                        .set('Content-Type', 'text/html')
                        .status(200)
                        .end(new Buffer(html));
                })
                .catch(next);
        };
        mod.view(req, res, next);
    });
};

exports.Router = function(config) {
    return new Router(config);
};
