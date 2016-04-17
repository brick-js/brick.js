const fs = require('../io/fs');
const Path = require('path');
const changeCase = require('change-case');
const _ = require('lodash');
const debug = require('debug')('brick:module:wmd');
const BPromise = require('bluebird');
const assert = require('assert');

var Render = require('./render');
var Processor = require('./processor');
var parser = require('./parser');

var cache = {};
var module = {
    // @return: Promise<HTML>
    ctrl: function(req, parentCtx) {
        function pctrl(mid, ctx){
            var mod = exports.get(mid);
            assert(mod, `module ${mid} not found`);
            return mod.ctrl(req, ctx);
        }
        return this.context(req, parentCtx)
            .then(ctx => this.render(this.html.path, ctx, pctrl, this.name));
    },
    // @return: Promise<ctx>
    context: function(req, parentCtx) {
        return this.resolver(req, parentCtx)
            .then(ctx => _.defaults(ctx || {}, parentCtx, req.app.locals));
    },
    resolver: (req, ctx) => BPromise.resolve(ctx)
};

function loadModule(path, config) {

    var mod = Object.create(module);
    var pkg = parser.package(path, config);

    _.extend(mod, {
        _pkg: pkg,
        path,
        id: changeCase.paramCase(pkg.name),
        name: pkg.name
    });

    var cssFile = Path.resolve(path, pkg.css.entry);
    if (fs.existSync(cssFile)) {
        mod.css = pkg.css;
        mod.css.path = cssFile;
        mod.css.render = Processor.css(mod.css.processor, mod);
    }

    var htmlFile = Path.resolve(path, pkg.html.entry);
    if (fs.existSync(htmlFile)) {
        mod.html = pkg.html;
        mod.html.path = htmlFile;
        mod.render = Render.factory(mod.html.engine);
    }

    var clientFile = Path.resolve(path, pkg.client.entry);
    if (fs.existSync(clientFile)) {
        mod.client = pkg.client;
        mod.client.path = clientFile;
        mod.client.render = Processor.js(mod.client.processor, mod);
    }

    var svr = parser.server(pkg, path) || {};
    if(svr.url){
        mod.url = svr.url;
    }
    if (typeof svr.view === 'function') {
        mod.resolver = (req, ctx) => new BPromise(svr.view.bind({
            context: ctx
        }, req));
    }

    debug(`${path} loaded as ${mod.id}`);
    return cache[mod.id] = mod;
}

exports.get = mid => cache[changeCase.paramCase(mid)];
exports.loadModule = loadModule;
exports.loadAll = function(config) {
    var modules = fs.subdirsSync(config.root)
        .map(dir => Path.resolve(config.root, dir))
        .map(path => loadModule(path, config));
    return modules;
};
