var _ = require('lodash');
var config = require('./config');
var Router = require('./app/router');
var Module = require('./module/wmd');
var Render = require('./module/render');
var debug = require('debug')('brick:index');

var brick = {
    engine: (type, engine) => Render.register(type, engine),
};

function factory(cfg){
    cfg = config.factory(cfg);
    debug('config loaded:', JSON.stringify(cfg, null, 4));

    var modules = Module.loadAll(cfg);
    var router = Router(cfg);

    router.mountModules(modules);
    router.mountErrorHandlers();

    var brk = Object.create(brick);
    brk.root = cfg.root;
    brk.express = router.get();

    return brk;
}

module.exports = factory;
