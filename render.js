var changeCase = require('change-case');
var _ = require('lodash');
var debug = require('debug')('brick:render');
var cheerio = require('cheerio');
var fs = require('fs');
var changeCase = require('change-case');
var path = require('path');
var sharedRender = null;

function Render(config) {
    this.config = config;
    this.engine = config.engine;
}

Render.prototype.render = function(tplPath, ctx, pctrl){
    tplPath = path.resolve(this.config.root, tplPath);
    return this.engine.render(tplPath, ctx, pctrl);
};

Render.prototype.modularize = function(mod, html){
    html = '<div>' + html.trim() + '</div>';
    var $ = cheerio.load(html),
        ele = $('div');
    ele.children().first()
        .addClass('brk')
        .addClass('brk-' + changeCase.paramCase(mod.name))
        .attr('data-brk', mod.name);
    return ele.html();
};

Render.prototype.linkStatic = function(html) {
    var $ = cheerio.load(html),
        $head = $('head');
    $head
        .append($('<link rel="stylesheet">').attr('href', this.config.css.url))
        .append($('<script></script>').attr('src', this.config.js.url));
    return $.html();
};

Render.create = (config) => sharedRender = new Render(config);

Render.shared = () => sharedRender;

module.exports = Render;
