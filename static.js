var path = require('path');
var fs = require('fs');
var file = require('./file');
var util = require('util');
var less = require('less');
var _ = require('lodash');
var changeCase = require('change-case');
var debug = require('debug')('brick:static');
var http = require('./http');
var express = require('express');

var clientLoader = path.resolve(__dirname, 'client.js');
var brkLoader = loaderWrapper(fs.readFileSync(clientLoader, 'utf8'));
var contentType = {
    js: 'application/javascript',
    css: 'text/css'
};
var defaultConfig = {
    css: {
        processor: cssProcessorFactory
    }
};

function cssProcessorFactory(renderer) {
    return {
        render: (path, rootClass) =>
            file.read(path)
            .then(css => `${rootClass}{\n${css}\n}\n`)
            .then(compile)
    };
}

function compile(src) {
    return new Promise((resolve, reject) =>
        less.render(src, (e, output) =>
            e ? reject(parseError(e)) : resolve(output.css)));
}

function Static(_config) {
    var config = _.defaultsDeep(_config.static, defaultConfig);
    config.css.processor = config.css.processor({
        root: _config.root
    });

    this.modules = _config.modules;
    this.config = config;
}

Static.prototype.express = function() {
    var expressRouter = express.Router();
    expressRouter.get(this.config.js.url, this._expressFactory('js'));
    expressRouter.get(this.config.css.url, this._expressFactory('css'));
    return expressRouter;
};

Static.prototype._expressFactory = function(type) {
    return (req, res, next) =>
        this.update(type).then(dirty => {
            var resolver = type === 'css' ? 'getCss' : 'getJs';
            return this[resolver]();
        })
        .then(content => {
            http.send(res, contentType[type], 200, content);
            return content;
        })
        .then(content => {
            var filename = this.config[type].file;
            if (!filename) return true;

            return file.write(filename, content)
                .catch(e => console.warn('cannot write ' + filename));
        }).catch(next);
};

Static.prototype.update = function(type) {
    var staticFile = type === 'css' ? 'cssPath' : 'cltPath';

    var ps = _.map(this.modules, mod =>
        file.read(mod[staticFile])
        .then(file => mod[type] = file)
    );
    return Promise.all(ps);
};

Static.prototype.getCss = function() {
    var config = this.config.css;

    function render(mod) {
        var rootClass = `.brk-${changeCase.paramCase(mod.id)}`;
        return config.processor
            .render(mod.cssPath, rootClass)
            .then(css => {
                var comment = util.format(config.comment, mod.id);
                return `${comment}\n${css}\n`;
            });
    }

    return Promise.all(_.map(this.modules, render))
        .then(styles => styles.reduce((prev, next) => prev + next, ''));
};

Static.prototype.getJs = function() {
    var modules = this.modules,
        comment = this.config.js.comment;
    var js = _.reduce(modules, (res, mod) =>
        res + jsForModule(mod, comment), brkLoader);
    return Promise.resolve(js);
};

function jsForModule(mod, commentFormat) {
    if (!mod.js) return '';
    var comment = util.format(commentFormat, mod.id);
    return `\n${comment}\nwindow.brk.${mod.id}=function(mod, console){\n${mod.js}}\n`;
}

function loaderWrapper(str) {
    var src = str.replace(/[\n\r]/g, '').replace(/\s+/g, ' ');
    return '// Brick.js https://github.com/harttle/brick.js\n\n// loader\n' + src + '\n';
}

module.exports = config => new Static(config);
