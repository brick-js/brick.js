var Module = require('./module');
var file = require('./file');
var _ = require('lodash');
var router = require('./router');
var debug = require('debug')('brick:index');

module.exports = function(config) {
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
        engine: function(tpl, locals, cb) {
            cb(new Error('render engine not set'));
        }
    };
    config = _.defaultsDeep(config, defaultConfig);

    var modules = Module.load(config.root);
    return router.Router(config).mountModules(modules);
};

