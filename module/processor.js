const _ = require('lodash');
const changeCase = require('change-case');
const debug = require('debug')('brick:module:processor');
const assert = require('assert');

var processors = {};
var cache = {};

function css(type, mod){
    var rootClass = `.brk-${changeCase.paramCase(mod.id)}`;
    return x => {
        var processor = processors[type];
        assert(processor, `processor ${type} not found`);
        return processor.render(mod.css.path, rootClass);
    };
}

function js(type, mod){
    return x => {
        var processor = processors[type];
        assert(processor, `processor ${type} not found`);
        return processor.render(mod.client.path);
    };
}

function register(type, processor, root){
    assert(processor, `processor must not be null`);
    assert(typeof processor.render === 'function', 
        `processor.render(${type}) must be a function`);
    processor.root = root;
    return processors[type] = processor;
}

function cacheable(cb, type, mod){
    var k = `${type}/${mod.id}`;
    return cache[k] || (cache[k] = cb(type, mod));
}

exports.css = (type, mod) => cacheable(css, type, mod);
exports.js = (type, mod) => cacheable(js, type, mod);
exports.register = register;
exports.get = type => processors[type];

