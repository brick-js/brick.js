var file = require('./file');
var serverFileName = 'server.js';
var clientFileName = 'client.js';
var tplFileName = 'index.html';
var changeCase = require('change-case');
var _ = require('lodash');
var debug = require('debug')('brick:module');
var Render = require('./render');

var modules = {};
var count = 0;
var defaultResolver = (req, done, fail) => done({});

function Module(config) {
    debug('init module:', config.name);

    this.config = config;
    this.hash = count++;
    this.name = this.id = changeCase.camelCase(config.name);
    modules[this.id] = this;

    this.serverPath = file.resolvePath(config.path, serverFileName);
    this.tplPath = config.name + '/' + tplFileName;

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
            this.tplPath,
            _.defaults(localCtx, ctx),
            pctrl))
        .then(_.partial(Render.shared().modularize, this));
};

// @return: Promise<ctx>
Module.prototype.context = function(req) {
    return new Promise(_.partial(this.resolver, req));
};

Module.get = mid => modules[changeCase.camelCase(mid)];

Module.factory = function(config) {
    return new Module(config);
};

Module.load = function(path) {
    debug('loading modules:', path);
    modules = {};
    count = 0;
    file.subDirectories(path).forEach(Module.factory);
    debug(count, 'modules loaded');
    return modules;
};

module.exports = Module;
