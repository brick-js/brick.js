var _ = require('lodash');
var config = require('./config');
var Router = require('./app/router');
var Static = require('./app/static');
var Module = require('./module/wmd');
var Render = require('./module/render');
var Processor = require('./module/processor.js');
var debug = require('debug')('brick:index');

var brick = {
    engine: (type, engine) => Render.register(type, engine),
    processor: function(type, processor) {
        Processor.register(type, processor, this.root);
    }
};

function factory(cfg){
    cfg = config.factory(cfg);

    var modules = Module.loadAll(cfg);
    var sttc = Static(modules, cfg.static);
    var router = Router(cfg);

    router.mountModules(modules);
    router.mountStatic(sttc.express());
    router.mountErrorHandlers();

    var brk = Object.create(brick);
    brk.root = cfg.root;
    brk.express = router.get();

    return brk;
}

module.exports = factory;
