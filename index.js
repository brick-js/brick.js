var Module = require('./module');
var file = require('./file');
var _ = require('lodash');
var Router = require('./router');
var debug = require('debug')('brick:index');
var Sttc = require('./static');
var Render = require('./render');

var defaultEngine = {
    tplExt: '.html',
    render: (tpl, locals, cb) => cb(new Error('ENOENGINE'))
};

var defaultConfig = {
    root: __dirname,
    css: {
        url: '/css/index.css',
        compress: false,
        file: 'index.css'
    },
    js: {
        url: '/js/index.js',
        compress: false,
        file: 'client.js'
    },
    engine: defaultEngine
};

function Brick(config) {
    this.config = config;
    this.render = Render.create(config);
    this.modules = Module.load(config);
    this.router = Router(config);
    this.router
        .mountStatic(Sttc(config))
        .mountModules(this.modules);
    this.express = this.router.get();
}

module.exports = function(config) {
    var config = _.defaultsDeep(config || {}, defaultConfig)
    config.engine.root = config.root;
    return new Brick(config);
};
