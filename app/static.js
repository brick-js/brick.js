const fs = require('../io/fs');
const http = require('../io/http');
const util = require('util');
const _ = require('lodash');
const changeCase = require('change-case');
const debug = require('debug')('brick:app:static');
const express = require('express');
const BPromise = require('bluebird');
const client = require('./client.js');

function Static(modules, config) {
    this.config = config;
    this.modules = modules;
}

Static.prototype.getCss = function() {
    var commentFmt = this.config.css.comment;
    return BPromise.resolve(this.modules)
        .map(render)
        .map(commentize)
        .then(combine);

    function render(mod) {
        return mod.css ? mod.css.render().then(src => ({ src, mod })) 
            : { src: "",  mod: mod};
    }

    function commentize(item) {
        var src = item.src,
            mod = item.mod,
            comment = util.format(commentFmt, mod.id);
        return `${comment}\n${src}\n`;
    }
};

Static.prototype.getJs = function() {
    var commentFmt = this.config.js.comment;
    return BPromise.resolve(this.modules)
        .map(render)
        .map(isolate)
        .map(commentize)
        .then(files => [client.loader].concat(files))
        .then(combine);

    function render(mod) {
        return mod.client ? mod.client.render().then(src => ({src, mod}))
            : { src: '', mod: mod };
    }
    function isolate(item){
        var mod = item.mod, src = item.src, name = changeCase.camelCase(mod.id);
        item.src = `window.brk.${name}=function(brk){\n${src}};\n`;
        return item;
    }
    function commentize(item) {
        var src = item.src,
            mod = item.mod,
            comment = util.format(commentFmt, mod.id);
        return `${comment}\n${src}\n`;
    }
};

Static.prototype.express = function() {
    var router = express.Router(),
        config = this.config,
        cssFile = config.css.file,
        jsFile = config.js.file;

    router.get(config.js.url, (req, res, next) => this.getJs()
        .then(content => http.ok(res, 'application/javascript', content))
        .catch(next)
        .then(content => jsFile && fs.write(jsFile, content))
        .catch(e => console.warn('cannot write ' + jsFile)));

    router.get(config.css.url, (req, res, next) => this.getCss()
        .then(content => http.ok(res, 'text/css', content))
        .catch(next)
        .then(content => cssFile && fs.write(cssFile, content))
        .catch(e => console.warn(`cannot write ${cssFile}: ${e}`)));
    return router;
};

function combine(files) {
    return files.reduce((prev, next) => prev + next, '');
}

module.exports = (mods, config) => new Static(mods, config);

