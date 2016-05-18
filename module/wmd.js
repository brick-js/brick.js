const fs = require('../io/fs');
const Path = require('path');
const _ = require('lodash');
const debug = require('debug')('brick:module:wmd');
const BPromise = require('bluebird');
const assert = require('assert');
const Render = require('./render');
const parser = require('./parser');

var cache = {};

var module = {
    // @return: Promise<HTML>
    render: function(req, res, ctx, method) {
        debug(`rendering ${this.id}`);

        var renderById = _.partialRight(doRenderById, req, res);
        return this.context(req, res, ctx, method)
            .then(ctx => {
                return this.renderer(this.template, ctx, renderById, this.id);
            });
    },

    // @return: Promise<ctx>
    context: function(req, res, parentCtx, method) {
        var router = this.router[method || 'get'];
        return router(req, res, parentCtx)
            .then(ctx => _.defaults(ctx || {}, parentCtx, req.app.locals));
    }
};

function doRenderById(mid, ctx, req, res) {
    var mod = exports.get(mid);
    assert(mod, `module ${mid} not found`);

    return mod.render(req, res, ctx);
}

function loadModule(path, config) {
    debug(`loading ${path}`);

    var mod = Object.create(module);
    var pkg = parser.parsePackageFile(Path.resolve(path, 'package.json'));
    pkg = _.extend({}, config, pkg);

    mod.id = pkg.name || parser.normalize(Path.basename(path));
    mod.path = path;
    mod.template = parser.parseTemplate(path, pkg);
    mod.router = parser.parseRouter(Path.resolve(path, pkg.router));
    mod.renderer = Render.get(Path.extname(mod.template));

    return cache[mod.id] = mod;
}

exports.get = mid => cache[mid];

exports.clear = x => cache = {};

exports.loadAll = function(config) {
    assert(config.view, 'config.view lost');
    assert(config.router, 'config.router lost');
    assert(config.root, 'config.root lost');

    var root = config.root;
    var cfg = _.pick(config, 'view', 'router');

    return fs.subdirsSync(root)
        .map(dir => Path.resolve(root, dir))
        .map(path => loadModule(path, cfg));
};
