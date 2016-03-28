var file = require('./file');
var path = require('path');
var changeCase = require('change-case');
var _ = require('lodash');
var debug = require('debug')('brick:module');
var Render = require('./render');
var defaultResolver = (req, done, fail) => done({});
var Bluebird = require('bluebird');

function Module(name) {
    debug('init module:', name);

    this.file = name;
    this.hash = Module.count++;
    this.id = changeCase.camelCase(name);
    this.utime = {}; // update time
    Module.modules[this.id] = this;

    this.path = path.resolve(Module.config.root, this.file);
    this.svrPath = path.resolve(this.path, Module.config.path.svr);
    this.tplPath = path.resolve(this.path, Module.config.path.tpl);
    this.cltPath = path.resolve(this.path, Module.config.path.clt);
    this.cssPath = path.resolve(this.path, Module.config.path.css);

    if (file.canRead(this.svrPath)) {
        var server = require(this.svrPath) || {};
        this.url = server.url; // Express url format
        this.resolver = server.resolver; // Function(req, done, fail)
    }
    this.resolver = this.resolver || defaultResolver;
}

// @return: Bluebird<HTML>
Module.prototype.ctrl = function(req, ctx) {
    var render = Render.shared(),
        pctrl = (mid, subCtx) => {
            var mod = Module.get(mid);
            if (!mod) {
                var msg = `module ${mid} not found`;
                throw new Error(msg);
            }
            return mod.ctrl(req, _.defaults(subCtx, ctx));
        };
    return this.context(req, ctx)
        .then(localCtx =>{
            var locals = _.defaults(localCtx, ctx, req.app.locals);
            return render.render(this.tplPath, locals, pctrl);
        })
        .then(html =>
            Render.shared().modularize(this, html));
};

// @return: Bluebird<ctx>
Module.prototype.context = function(req, ctx) {
    return new Bluebird(_.partial(this.resolver, req).bind({
        context: ctx
    }));
};

Module.get = mid => Module.modules[changeCase.camelCase(mid)];

Module.factory = function(name) {
    return new Module(name);
};

Module.load = function(config) {
    debug('loading modules:', config.root);
    Module.config = config;
    Module.modules = {};
    Module.count = 0;
    file.subDirectories(config.root).forEach(Module.factory);
    debug(Module.count + ' modules loaded');

    return Module.modules;
};

module.exports = Module;
