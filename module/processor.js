const less = require('less');
const _ = require('lodash');
const changeCase = require('change-case');
const debug = require('debug')('brick:module:processor');
const BPromise = require('bluebird');
const assert = require('assert');
const process = require('process');
const path = require('path');
const fs = require('../io/fs');

var processors = {
    js: {
        render: path => fs.read(path)
    },
    css: {
        render: (path, rootClass) => {
            function compile(src) {
                return new BPromise((resolve, reject) => {
                    less.render(src, (e, output) => {
                        return e ? reject(parseError(e)) : resolve(output.css);
                    });
                });

                function parseError(e){
                    return {
                        message: e.message,
                        stack: JSON.stringify(e, null, 4)
                    };
                }
            }
            return fs.read(path)
                .then(src => `${rootClass}{\n${src}\n}\n`)
                .then(compile);
        }
    }
};

function css(type, mod){
    var rootClass = `.brk-${changeCase.paramCase(mod.id)}`;
    return x => {
        var processor = processors[type];

        debug(type, processor)

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

function register(type, processor){
    assert(processor, `processor must not be null`);
    assert(typeof processor.render === 'function', 
        `processor.render(${type}) must be a function`);
    return processors[type] = processor;
}

var cache = {};
function cacheable(cb, type, mod){
    var k = `${type}/${mod.id}`;
    return cache[k] || (cache[k] = cb(type, mod));
}

exports.css = (type, mod) => cacheable(css, type, mod);
exports.js = (type, mod) => cacheable(js, type, mod);
exports.register = register;
