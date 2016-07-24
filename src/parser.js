const Path = require('path');
const assert = require('assert');
const fs = require('fs');
const _ = require('lodash');
const debug = require('debug')('brick:module:parser');
const httpStatusMsg = require('./http-status.json');
const BPromise = require('bluebird');

function parseTemplate(path, pkg) {
    var views = pkg.view instanceof Array ? pkg.view : [pkg.view];
    assert(views.length, 'view entry for pkg not found');
    for (var i = 0; i < views.length; i++) {
        var template = Path.resolve(path, views[i]);
        try {
            fs.statSync(template);
            return template;
        } catch (e) {}
    }
    return Path.resolve(path, views[0]);
}

function parsePackageFile(path) {
    try {
        return require(path);
    } catch (e) {
        return {};
    }
}

function parseRouter(path) {
    var file = {},
        router = {};
    try {
        file = _.pick(require(path), 'url', 'get', 'post', 'put', 'delete');
    } catch (e) {}

    router.url = file.url;
    router.get = parseController(file.get || ((req, res) => res.render()));
    router.put = parseController(file.put);
    router.post = parseController(file.post);
    router.delete = parseController(file.delete);

    return router;
}

function parseController(ctrl) {
    if(!ctrl) return undefined;
    return (req, res, ctx) => new BPromise((resolve, reject) => {
        res.render = resolve;
        return ctrl.call(ctx, req, res, reject);
    });
}

function normalize(id) {
    var res = id.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
    if (id !== res) {
        debug(`brick "${id}" better be hyphen-separated and lowercased`);
    }
    return res;
}

module.exports = {
    normalize, parseController, parseTemplate, parsePackageFile, parseRouter
};
