const _ = require('lodash');
const debug = require('debug')('brick:module:render');
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

// naive implementation
// it's quite difficult to parse HTML element
function modularize(modName, html) {
    var cls = 'brk-' + changeCase.paramCase(modName);
    html = html.trim();

    if(html.length && html[0] == '<'){
        var spliter = html.indexOf('>');
        if(spliter >= 0){
            var first = html.slice(0, spliter);
            var second = html.slice(spliter);

            var hasClass = / class=["']/.test(first);
            if(hasClass){
                first = first.replace(/ class=["']/, match => match + cls + ' ');
            }
            else{
                var idx = first.indexOf(' ');
                if(idx >= 0){
                    first = first.replace(' ', ` class="${cls}" `);
                }
                else{
                    first = `${first} class="${cls}"`;
                }
            }
            return first + second;
        }
        
    }
    return `<div class='${cls}'>${html}</div>`;
}

function register(type, engine) {
    assert(engine, `engine must not be null`);
    assert(typeof engine.render === 'function',
        `engine.render(${type}) must be a function`);
    return engines[type] = engine;
}

// naive implementation
function linkStatic(html, jsUrl, cssUrl) {
    var script = `<script src="${jsUrl}"></script>`;
    var link = `<link rel="stylesheet" href="${cssUrl}">`;

    if(/<\/head>/.test(html)){
        html = html.replace('</head>', `${link}</head>`);
    }
    else if(/<\/body>/.test(html)){
        html = html.replace('</body>', `${link}</body>`);
    }
    else if(/<\/html>/.test(html)){
        html = html.replace('</html>', `${link}</html>`);
    }

    if(/<\/body>/.test(html)){
        html = html.replace('</body>', `${script}</body>`);
    }
    else if(/<\/head>/.test(html)){
        html = html.replace('</head>', `${script}</head>`);
    }
    else if(/<\/html>/.test(html)){
        html = html.replace('</html>', `${script}</html>`);
    }
    return html;
}

exports.factory = type => cache[type] || (cache[type] = factory(type));
exports.register = register;
exports.linkStatic = linkStatic;
exports.modularize = modularize;
