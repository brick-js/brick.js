const Path = require('path');
const fs = require('fs');
const _ = require('lodash');
const debug = require('debug')('brick:parser');
const BPromise = require('bluebird');

function parseTemplate(path, pkg) {
    //debug(`parseTemplate:${path}, ${pkg.view}`);
    var views = pkg.view instanceof Array ? pkg.view : [pkg.view];
    for (var i = 0; i < views.length; i++) {
        var template = Path.resolve(path, views[i]);
        try {
            fs.statSync(template);
            return template;
        } catch (e) {}
    }
    return Path.resolve(path, views[0]);
}

function parsePackageFile(f) {
    try {
        return require(f);
    } catch (e) {
        return {};
    }
}

function parseRouter(path) {
    var file = {},
        router = {};

    if (exists(path)) {
        file = _.pick(require(path), 'url', 'get', 'post', 'put', 'delete');
    }

    router.url = file.url;
    router.get = parseController(file.get || ((req, res) => res.render()), path);
    router.put = parseController(file.put, path);
    router.post = parseController(file.post, path);
    router.delete = parseController(file.delete, path);

    return router;
}

function exists(file) {
    try {
        fs.statSync(file);
        return true;
    } catch (e) {
        return false;
    }
}

function parseController(ctrl, path) {
    if (!ctrl) return undefined;
    return (req, res, ctx) => (new BPromise((resolve, reject) => {
        var proxy = _.clone(res);
        proxy.locals = ctx;
        proxy.render = function(context) {
            debug(`res.render called for ${path}, resolving context...`);
            context = _.assign({}, proxy.locals, context);
            resolve(context);
        };
        ctrl(req, proxy, reject);
    }));
}

function normalize(id) {
    var res = id.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
    if (id !== res) {
        console.warn(`"${id}" will be hyphen-separated and lowercased`);
    }
    return res;
}

module.exports = {
    normalize,
    parseController,
    parseTemplate,
    parsePackageFile,
    parseRouter
};
