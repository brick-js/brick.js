const Path = require('path');
const assert = require('assert');
const fs = require('../io/fs');
const _ = require('lodash');
const debug = require('debug')('brick:module:parser');
const httpStatusMsg = require('../io/http-status.json');
const BPromise = require('bluebird');

function defaultRouterGet(req, done, fail) {
    done();
}

function parseTemplate(path, config) {
    var views = config.view instanceof Array ? config.view : [config.view];
    for (var i = 0; i < views.length; i++) {
        var template = Path.resolve(path, views[i]);
        if (fs.existSync(template)) return template;
    }
}

function parsePackageFile(path) {
    return fs.existSync(path) ? require(path) : {};
}

function parseRouter(path) {
    var file = {},
        router = {};
    if (fs.existSync(path)) {
        file = _.pick(require(path), 'url', 'get', 'post', 'put', 'delete');
    }

    if (file.url){
        router.url = file.url;
    } 
    router.get = parseController(file.get || defaultRouterGet);
    if (file.put) router.put = parseController(file.put);
    if (file.post) router.post = parseController(file.post);
    if (file.delete) router.delete = parseController(file.delete);

    return router;
}

function parseController(ctrl) {
    return (req, res, ctx) => new BPromise((resolve, reject) => {
        var done = resolve;
        var fail = _.partial(doFail, reject);
        //debug(`calling ctrl: ${ctrl}`);
        return ctrl.call(ctx, req, done, fail, res);
    });
}

function doFail(cb, status, msg) {
    if (status instanceof Error) return cb(status);

    status = status || 500;
    msg = msg || httpStatusMsg[status] || 'Unkown Error';

    var err = new Error(msg);
    err.status = status;
    cb(err);
}

function normalize(id) {
    var res = id.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
    if (id !== res) {
        debug(`brick "${id}" better be hyphen-separated and lowercased`);
    }
    return res;
}

module.exports = {
    normalize, doFail, parseController, parseTemplate, parsePackageFile, parseRouter
};
