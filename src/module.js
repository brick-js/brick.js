const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const debug = require('debug')('brick:module');
const BPromise = require('bluebird');
const assert = require('assert');
const Render = require('./render');
const parser = require('./parser');

module.exports = function() {
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

            parentCtx = _.assign({}, parentCtx, res.locals);
            return router(req, res, parentCtx)
                .then(ctx => {
                    debug(ctx, parentCtx, req.app.locals);
                    ctx = _.assign({}, req.app.locals, parentCtx, ctx);
                    return ctx;
                });
        }
    };

    function doRenderById(mid, ctx, req, res) {
        var mod = get(mid);
        assert(mod, `module ${mid} not found`);

        return mod.render(req, res, ctx);
    }

    function loadModule(mpath, config) {
        debug(`loading ${mpath}`);

        var mod = Object.create(module);
        var pkg = parser.parsePackageFile(path.resolve(mpath, 'package.json'));
        pkg = _.extend({}, config, pkg);

        mod.id = pkg.name || parser.normalize(path.basename(mpath));
        mod.path = mpath;
        mod.template = parser.parseTemplate(mpath, pkg);
        mod.router = parser.parseRouter(path.resolve(mpath, pkg.router));
        mod.renderer = Render.get(path.extname(mod.template));

        return cache[mod.id] = mod;
    }

    function get(mid) {
        return cache[mid];
    }

    function clear(x) {
        cache = {};
    }

    function loadAll(config) {
        assert(config.view, 'config.view lost');
        assert(config.router, 'config.router lost');
        assert(config.root, 'config.root lost');

        var root = config.root;
        var cfg = _.pick(config, 'view', 'router');


        return fs
            .readdirSync(root)
            .filter(fileName => {
                var filepath = path.resolve(root, fileName);
                return fs.statSync(filepath).isDirectory();
            })
            .map(dir => path.resolve(root, dir))
            .map(path => loadModule(path, cfg));
    }
    return {
        loadAll: loadAll,
        loadModule: loadModule,
        get: get,
        clear: clear
    };
};
