var path = require('path');
var fs = require('fs');
var less = require('less');
var file = require('./file');
var util = require('util');
var _ = require('lodash');
var changeCase = require('change-case');
var debug = require('debug')('brick:static');
var http = require('./http');
var express = require('express');
var brkLoader = fs.readFileSync(path.resolve(__dirname, 'client.js'), 'utf8');
var contentType = {
    js: 'application/javascript',
    css: 'text/css'
};

function Static(config) {
    this.config = config.static;
    this.root = config.root;
    this.modules = config.modules;
    this.cache = {};
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
            return this[resolver]().then(content => {
                http.send(res, contentType[type], 200, content);
                var filename = this.config[type].file;
                if (filename) {
                    return file.write(filename, content);
                }
            });
        }).catch(next);
};

Static.prototype.update = function(type) {
    var staticFile = type === 'css' ? 'cssPath' : 'cltPath';

    var ps = _.map(this.modules, mod =>
        file.read(mod[staticFile])
        .catch(e => false)
        .then(file => mod[type] = file || '')
    );
    return Promise.all(ps);
};

Static.prototype.getCss = function() {
    var modules = this.modules,
        comment = this.config.css.comment;
    var src = _.reduce(modules, (res, mod) =>
        res + lessForModule(mod, comment), '');
    return compileLess(src, {
        compress: this.config.css.compress
    });
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

function lessForModule(mod, commentFormat) {
    if (!mod.css) return '';
    var comment = util.format(commentFormat, mod.id),
        className = changeCase.paramCase(mod.id);
    return `\n${comment}\n.brk-${className}{\n${mod.css}\n}\n`;
}

function compileLess(src, config) {
    return new Promise((resolve, reject) =>
        less.render(src, config, (e, output) =>
            e ? reject(e) : resolve(output.css)));
}

module.exports = config => new Static(config);
