const _ = require('lodash');
const debug = require('debug')('brick:module:render');
const assert = require('assert');
const BPromise = require('bluebird');
const fs = require('fs');
BPromise.promisifyAll(fs);

var engines = {
    '.html': {
        render: path => fs.readFileAsync(path, 'utf8')
    }
};
var cache = {};

function get(ext) {
    return function(tplPath, ctx, pctrl, modName) {
        var engine = engines[ext];
        assert(engine, `engine for ${ext} not found`);
        var pmodularize = _.partial(modularize, modName);
        return engine
            .render(tplPath, ctx, pmodularize, pctrl);
    };
}

// naive implementation
// it's quite difficult to parse HTML element
function modularize(modName, html) {
    var cls = 'brk-' + modName;

    // there's a <x
    if(/<\w/.test(html)){       
        var header = '', body = '', footer = '';
        var match = html.match(/<\w/); 
        var begin = match.index;
        // before tab
        header = html.substr(0, begin);   

        var end = html.indexOf('>', begin);
        // there's a >
        if(end >= 0){               
            // before >
            body = html.slice(begin, end);
            // after (include) >
            footer = html.substr(end);

            var hasClass = / class=["']/.test(body);
            if(hasClass){
                body = body.replace(/ class=["']/, match => match + cls + ' ');
            }
            else{
                var idx = body.indexOf(' ');
                if(idx >= 0){
                    body = body.replace(' ', ` class="${cls}" `);
                }
                else{
                    body = `${body} class="${cls}"`;
                }
            }
            return header + body + footer;
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

exports.get = type => cache[type] || (cache[type] = get(type));
exports.register = register;
exports.modularize = modularize;
