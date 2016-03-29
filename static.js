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

var clientLoader = loadClientLoader('client.js');
var defaultConfig = {
    css: {
        processor: cssProcessorFactory
    },
    js: {
        processor: jsProcessorFactory
    }
};

function Static(_config) {
    var config = _.defaultsDeep(_config.static, defaultConfig);
    config.css.processor = config.css.processor({
        root: _config.root
    });
    config.js.processor = config.js.processor();

    this.modules = _config.modules;
    this.config = config;
}

Static.prototype.express = function() {
    var expressRouter = express.Router();
    expressRouter.get(this.config.js.url,
        this._expressFactory(
            this.getJs.bind(this),
            'application/javascript',
            this.config.js.file
        ));
    expressRouter.get(this.config.css.url,
        this._expressFactory(
            this.getCss.bind(this),
            'text/css',
            this.config.css.file
        ));
    return expressRouter;
};

Static.prototype._expressFactory = function(resolver, contentType, filename) {
    return (req, res, next) => resolver()
        .then(content => http.ok(res, contentType, content))
        .catch(next)
        .then(content => filename && file.write(filename, content))
        .catch(e => console.warn('cannot write ' + filename));
};

Static.prototype.getCss = function() {
    var processor = this.config.css.processor,
        commentFmt = this.config.css.comment;
    return Promise.resolve(this.modules)
        .map(render)
        .map(commentize)
        .then(combine);

    function render(mod) {
        var rootClass = `.brk-${changeCase.paramCase(mod.id)}`;
        return processor.render(mod.cssPath, rootClass).then(src => ({
            src: src,
            mod: mod
        }));
    }

    function commentize(item) {
        var src = item.src,
            mod = item.mod,
            comment = util.format(commentFmt, mod.id);
        return `${comment}\n${src}\n`;
    }
};

Static.prototype.getJs = function() {
    var commentFmt = this.config.js.comment,
        processor = this.config.js.processor;
    return Promise.resolve(this.modules)
        .map(render)
        .map(isolate)
        .map(commentize)
        .then(files => [clientLoader].concat(files))
        .then(combine);

    function render(mod) {
        return processor.render(mod.cltPath)
            .then(src => ({
                src: src,
                mod: mod
            }));
    }
    function isolate(item){
        var mod = item.mod, src = item.src;
        item.src = `window.brk.${mod.id}=function(brk){\n${src}}\n`;
        return item;
    }
    function commentize(item) {
        var src = item.src,
            mod = item.mod,
            comment = util.format(commentFmt, mod.id);
        return `${comment}\n${src}\n`;
    }
};

function loadClientLoader(file) {
    var src = fs.readFileSync(path.resolve(__dirname, file), 'utf8'),
        comment = '// Brick.js https://github.com/harttle/brick.js\n\n// loader';
    src = src.replace(/[\n\r]/g, '').replace(/\s+/g, ' ');
    return `${comment}\n${src}\n\n`;
}

function jsProcessorFactory() {
    return {
        render: path => file.read(path)
    };
}

function cssProcessorFactory() {
    return {
        render: (path, rootClass) =>
            file.read(path)
            .then(css => `${rootClass}{\n${css}\n}\n`)
            .then(compile)
    };

    function compile(src) {
        return new Promise((resolve, reject) =>
            less.render(src, (e, output) =>
                e ? reject(parseError(e)) : resolve(output.css)));
    }
}

function combine(files) {
    return files.reduce((prev, next) => prev + next, '');
}

module.exports = config => new Static(config);
