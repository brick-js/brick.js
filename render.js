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
    return this.engine.render(tplPath, ctx, pctrl);
};

Render.prototype.modularize = function(mod, html){
    html = '<div>' + html.trim() + '</div>';
    var $ = cheerio.load(html),
        ele = $('div');
        cls = 'brk-' + changeCase.paramCase(mod.id);
    ele.children().first().addClass(cls);
    return ele.html();
};

Render.prototype.linkStatic = function(html) {
    var $ = cheerio.load(html),
        $head = $('head');

    if($head.length === 0) $head = $('html');
    if($head.length === 0) $head = $.root();

    $head
        .append($('<script></script>').attr('src', this.config.static.js.url))
        .prepend($('<link rel="stylesheet">').attr('href', this.config.static.css.url));
    return $.html();
};

Render.create = (config) => sharedRender = new Render(config);

Render.shared = () => sharedRender;

module.exports = Render;
