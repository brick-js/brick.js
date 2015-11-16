var path = require('path');
var fs = require('fs');
var debug = require('debug')('brick-static');
var less = require('less');
var util = require('util');
var _ = require('lodash');
var cssComment = '/* brick.js module: %s */\n';
var jsComment = '// brick.js module: %s\n';
var brkLoader = fs.readFileSync(path.resolve(__dirname, 'client.js'), 'utf8');
var changeCase = require('change-case');

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
    }
};

function Static(config) {
    this.config = _.defaultsDeep(config, defaultConfig);
    this.root = config.root;
    this.modules = [];
}

Static.prototype.readModule = function(css, js, dir) {
    var pcss = readFile(path.join(this.root, dir, this.config.css.file));
    var pjs = readFile(path.join(this.root, dir, this.config.js.file));

    return Promise
        .all([safePromise(css, pcss), safePromise(js, pjs)])
        .then(_.spread(_.partial(parseModule, dir)));
};

Static.prototype.load = function(css, js) {
    debug('loading ' + (css && 'css ' || '') + (js && 'js ' || '') + ': ' + this.root);
    var self = this;

    return readDir(this.root)
        .then(function(dirs) {
            var ps = dirs.map(_.partial(self.readModule, css, js), self);
            return Promise.all(ps);
        })
        .then(function(modules) {
            self.modules = modules;
            return modules;
        });
};

Static.prototype.getCss = function(modules) {
    modules = modules || this.modules;
    var src = modules.reduce(function(res, module) {
        return res + lessForModule(module);
    }, '');
    return compileLess(src, {
        compress: this.config.css.compress
    });
};

Static.prototype.css = function() {
    return this.load(true, false).then(this.getCss.bind(this));
};

Static.prototype.getJs = function(modules) {
    modules = modules || this.modules;
    return modules.reduce(function(res, module) {
        return res + jsForModule(module);
    }, brkLoader);
};

Static.prototype.js = function() {
    return this.load(false, true).then(this.getJs.bind(this));
};

function jsForModule(module) {
    var comment = util.format(jsComment, module.name);
    return util.format('%swindow.brk.%s=function(brk, console){\n%s}\n\n',
        comment, module.name, module.js);
}

function lessForModule(module) {
    var comment = util.format(cssComment, module.name),
        className = changeCase.paramCase(module.name);
    return util.format('%s\n.brk-%s{\n%s\n}',
        comment, className, module.css);
}

function readFile(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf8', function(e, data) {
            return e ? reject(e) : resolve(data);
        });
    });
}

function readDir(dir) {
    return new Promise(function(resolve, reject) {
        fs.readdir(dir, function(e, files) {
            return e ? reject(e) : resolve(files);
        });
    });
}

function parseModule(dir, css, js) {
    return {
        name: changeCase.camelCase(dir),
        css: css,
        js: js
    };
}

function compileLess(src, config) {
    return new Promise(function(resolve, reject) {
        less.render(src, config, function(e, output) {
            return e ? reject(e) : resolve(output.css);
        });
    });
}

function safePromise(enabled, p) {
    return enabled ?
        p.catch(function(e) {
            return '';
        }) :
        Promise.resolve('');
}

exports.Static = function(config) {
    return new Static(config);
};
