var file = require('./file');
var serverFileName = 'server.js';
var clientFileName = 'client.js';
var tplBaseName = 'index';
var changeCase = require('change-case');
var _ = require('lodash');
var debug = require('debug')('brick:module');
var Render = require('./render');

var defaultResolver = (req, done, fail) => done({});

function Module(config) {
    debug('init module:', config.name);

    this.config = config;
    this.hash = Module.count++;
    this.name = this.id = changeCase.camelCase(config.name);
    Module.modules[this.id] = this;

    this.serverPath = file.resolvePath(config.path, serverFileName);
    this.tplPath = config.name + '/' + tplBaseName + Module.config.engine.tplExt;

    if (file.canRead(this.serverPath)) {
        var server = require(this.serverPath) || {};
        this.url = server.url; // Express url format
        this.resolver = server.resolver; // Function(req, done, fail)
    }
    this.resolver = this.resolver || defaultResolver;
}

// @return: Promise<HTML>
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
    return this.context(req)
        .then(localCtx => render.render(
            this.tplPath, _.defaults(localCtx, ctx), pctrl))
        .then(_.partial(Render.shared().modularize, this));
};

// @return: Promise<ctx>
Module.prototype.context = function(req) {
    return new Promise(_.partial(this.resolver, req));
};

Module.get = mid => Module.modules[changeCase.camelCase(mid)];

Module.factory = function(config) {
    return new Module(config);
};

Module.load = function(config) {
    debug('loading modules:', config.root);
    Module.config = config;
    Module.modules = {};
    Module.count = 0;
    file.subDirectories(config.root).forEach(Module.factory);
    debug(Module.count, 'modules loaded');

    if(!Module.modules['error']){
        throw new Error('error module not specified!');
    }
    return Module.modules;
};

module.exports = Module;
