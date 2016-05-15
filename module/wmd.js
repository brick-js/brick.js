const fs = require('../io/fs');
const Path = require('path');
const _ = require('lodash');
const debug = require('debug')('brick:module:wmd');
const BPromise = require('bluebird');
const assert = require('assert');

var Render = require('./render');
var parser = require('./parser');
var httpStatusMsg = require('../io/http-status.json');

var cache = {};
var module = {
    // @return: Promise<HTML>
    ctrl: function(req, parentCtx, res) {
        var htmlPath = this.html;
        if (!htmlPath) {
            var e = new Error(`template file for ${this.id} not found`);
            e.code = 'ENOENT';
            e.status = 404;
            throw (e);
        }

        function pctrl(mid, ctx) {
            var mod = exports.get(mid);
            assert(mod, `module ${mid} not found`);
            return mod.ctrl(req, ctx);
        }
        return this.context(req, parentCtx, res)
            .then(ctx => this.render(htmlPath, ctx, pctrl, this.id));
    },
    // @return: Promise<ctx>
    context: function(req, parentCtx, res) {
        return this.resolver(req, parentCtx, res)
            .then(ctx => _.defaults(ctx || {}, parentCtx, req.app.locals));
    },
    resolver: (req, ctx, res) => BPromise.resolve(ctx)
};

function loadModule(path, config) {
    debug('loading module with config:', config);

    var mod = Object.create(module);
    var pkg = parser.package(path, config);

    _.extend(mod, {
        _pkg: pkg,
        path,
        id: pkg.name
    });

    var views = pkg.view instanceof Array ? pkg.view : [pkg.view];
    for (var i = 0; i < views.length; i++) {
        var html = Path.resolve(path, views[i]);
        if (fs.existSync(html)) {
            mod.html = html;
            mod.render = Render.get(Path.extname(html));
            break;
        }
    }

    var svr = parser.server(pkg, path) || {};
    if (svr.url) {
        mod.url = svr.url;
    }
    if (typeof svr.view === 'function') {
        mod.resolver = (req, ctx, res) => new BPromise((resolve, reject) => {
            svr.view.call(ctx, req, resolve, (status, msg) => {
                if(status instanceof Error) return reject(status);

                status = status || 500;
                msg = msg || httpStatusMsg[status] || 'Unkown Error'; 
                var err = new Error(msg);
                err.status = status;
                return reject(err);
            }, res);
        });
    }

    debug(`${path} loaded as ${mod.id}`);
    return cache[mod.id] = mod;
}

exports.get = mid => cache[mid];
exports.loadModule = loadModule;
exports.loadAll = function(config) {
    var root = config.root;
    var defaultPackage = _.pick(config, 'view', 'server');
    var modules = fs.subdirsSync(root)
        .map(dir => Path.resolve(root, dir))
        .map(path => loadModule(path, defaultPackage));
    return modules;
};
