var Module = require('./module');
var changeCase = require('change-case');
var _ = require('lodash');
var debug = require('debug')('brick:render');
var cheerio = require('cheerio');
var fs = require('fs');
var changeCase = require('change-case');
var path = require('path');

function Render(config) {
    this.config = config;
    this.engine = config.engine;
}

Render.prototype.render = function(mod, req, res, next) {
    var self = this;
    return new Promise(function(resolve, reject) {
        newRes = _.defaults({
            render: function(locals) {
                _.merge(res.locals, locals);
                return self.doRender(mod, req, res, next).then(resolve).catch(next);
            }
        }, res);
        if (typeof mod.view === 'function')
            mod.view(req, newRes, next);
        else newRes.render();
    });
};

Render.prototype.doRender = function(mod, req, res, next) {
    var tpl = mod.tplDir,
        locals = res.locals,
        self = this;

    return new Promise(function(resolve, reject) {
        debug('rendering: ' + tpl);
        self.engine(tpl, locals, function(err, html) {
            if( err){
                debug(err);
                reject(err);
            }
            else{
                resolve(self.modularize(html, mod));
            }
        });
    });
};

Render.prototype.modularize = function(html, mod) {
    html = '<div>' + html.trim() + '</div>';
    var $ = cheerio.load(html),
        ele = $('div');
    ele.children().first()
        .addClass('brk')
        .addClass('brk-' + changeCase.paramCase(mod.name))
        .attr('data-brk', mod.name);
    return ele.html();
};

Render.prototype.addStatic = function(html) {
    var $ = cheerio.load(html),
        $head = $('head');
    $head
        .append($('<link rel="stylesheet">').attr('href', this.config.css.url))
        .append($('<script></script>').attr('src', this.config.js.url));
    return $.html();
};

exports.Render = function(config) {
    return new Render(config);
};
