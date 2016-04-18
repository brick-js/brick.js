const _ = require('lodash');
const debug = require('debug')('brick:module:render');
const cheerio = require('cheerio');
const changeCase = require('change-case');
const assert = require('assert');
const BPromise = require('bluebird');
const fs = require('../io/fs.js');

var engines = {
    html: {
        render: path => fs.read(path)
    }
};
var cache = {};

function factory(type) {
    return function(tplPath, ctx, pctrl, modName) {
        var engine = engines[type];
        assert(engine, `engine ${type} not found`);
        var pmodularize = _.partial(modularize, modName);
        return engine
            .render(tplPath, ctx, pmodularize, pctrl);
    };
}

function modularize(modName, html) {
    html = '<div>' + html.trim() + '</div>';
    var $ = cheerio.load(html),
        ele = $('div');
    cls = 'brk-' + changeCase.paramCase(modName);
    ele.children().first().addClass(cls);
    return ele.html();
}

function register(type, engine) {
    assert(engine, `engine must not be null`);
    assert(typeof engine.render === 'function',
        `engine.render(${type}) must be a function`);
    return engines[type] = engine;
}

function linkStatic(html, jsUrl, cssUrl) {
    var $ = cheerio.load(html),
        $head = $('head');

    if ($head.length === 0) $head = $('html');
    if ($head.length === 0) $head = $('body');
    if ($head.length === 0) $head = $.root();

    $head
        .append($('<script></script>').attr('src', jsUrl))
        .prepend($('<link rel="stylesheet">').attr('href', cssUrl));
    return $.html();
}

exports.factory = type => cache[type] || (cache[type] = factory(type));
exports.register = register;
exports.linkStatic = linkStatic;
