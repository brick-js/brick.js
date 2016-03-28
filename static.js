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
var Bluebird = require('bluebird');

var clientLoader = path.resolve(__dirname, 'client.js');
var brkLoader = loaderWrapper(fs.readFileSync(clientLoader, 'utf8'));
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

Static.prototype.update = function(type) {
    var staticFile = type === 'css' ? 'cssPath' : 'cltPath';

    var ps = _.map(this.modules, mod =>
        file.read(mod[staticFile])
        .then(file => mod[type] = file)
    );
    return Bluebird.all(ps);
};

Static.prototype.getCss = function() {
    var processor = this.config.css.processor,
        comment = this.config.css.comment;
    return Bluebird 
        .all(_.map(this.modules, load))
        .then(items => {
            debug(items)
            return items;
        })
        .then(items => _.map(items, item => render(item.src, item.mod)))
        .then(items => _.map(items, item => commentize(item.src, item.mod)))
        .then(combine);

    function load(mod){
        return file.read(mod.cssPath).then(src => ({
            src: src,
            mod: mod
        }));
    }
    function render(src, mod){
        var rootClass = `.brk-${changeCase.paramCase(mod.id)}`;
        return processor.render(src, rootClass).then(src => ({
            src: src,
            mod: mod
        }));
    }
    function commentize(src, mod) {
        var comment = util.format(comment, mod.id);
        return `${comment}\n${src}\n`;
    }
};

Static.prototype.getJs = function() {
    var comment = this.config.js.comment,
        processor = this.config.js.processor;
    return Bluebird
        .all(_.map(this.modules, render))
        .then(files => files.unshift(brkLoader))
        .then(combine);

    function render(mod){
    }
    var js = _.reduce(modules, (res, mod) =>
        res + jsForModule(mod, comment), brkLoader);
    return Bluebird.resolve(js);
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

function jsProcessorFactory() {
    return {
        render: (path, rootClass) =>
            file.read(path)
            .then(css => `${rootClass}{\n${css}\n}\n`)
            .then(compile)
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
        return new Bluebird((resolve, reject) =>
            less.render(src, (e, output) =>
                e ? reject(parseError(e)) : resolve(output.css)));
    }
}

function combine(files){
    return styles.reduce((prev, next) => prev + next, '');
}

module.exports = config => new Static(config);
