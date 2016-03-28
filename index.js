var Module = require('./module');
var file = require('./file');
var path = require('path');
var _ = require('lodash');
var Router = require('./router');
var debug = require('debug')('brick:index');
var Static = require('./static');
var Render = require('./render');
var Bluebird = require('bluebird');

var defaultEngine = {
    render: (tpl, ctx, pctrl) => Bluebird.reject(new Error('ENOENGINE'))
};

var defaultConfig = {
    root: path.join(__dirname, 'modules'),
    engine: defaultEngine,
    path: {
        svr: 'server.js',
        css: 'index.css',
        clt: 'client.js',
        tpl: 'index.html'
    },
    static: {
        css: {
            url: '/104097114116116108101.css',
            file: false,
            comment: '/* module: %s */'
        },
        js: {
            url: '/104097114116116108101.js',
            file: false,
            comment: '// module: %s'
        }
    }
};

function Brick(config) {
    this.config = config;
    this.render = Render.create(config);
    this.modules = Module.load(config);

    this.static = Static(_.defaults(config, {modules: this.modules}));
    this.router = Router(config);

    this.router.mountModules(this.modules);
    this.router.mountStatic(this.static.express());
    this.router.mountErrorHandlers();

    this.express = this.router.get();
}

module.exports = function(config) {
    config = _.defaultsDeep(config || {}, defaultConfig);
    return new Brick(config);
};

