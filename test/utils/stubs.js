const path = require('path');
const BPromise = require('bluebird');
const _ = require('lodash');

exports.brickConfig = {
    root: path.resolve(__dirname, '../cases'),
    html: {
        entry: 'index.html'
    },
    css: {
        entry: 'index.css'
    },
    server: {
        entry: 'server.js'
    }
};

exports.expressResponse = {
    set: function(){},
    status: function(){},
    end: function(){}
};

exports.hbs = {
    render: function(path, ctx, pmodularize, pctrl){
        var result = '<div>hbs engine stub</div>';
        result = pmodularize(result);
        pctrl('sub-module', ctx);
        return BPromise.resolve(result);
    }
};

exports.stylus = {
    render: function(path, rootClass){
        return BPromise.resolve(path + rootClass);
    }
};

exports.module = {
    id: 'mod',
    css: {
        path: '/foo'
    },
    client: {
        path: '/bar'
    }
};

var browser = {
    window: { },
    document: {
        addEventListener: function(name, cb) {
            this.events[name] = cb;
        },
        events: {},
        load: function(){
            this.readyState = 'complete';

            var cb = this.events.DOMContentLoaded;
            if(typeof cb === 'function') cb();

            cb = this.events.onreadystatechange;
            if(typeof cb === 'function') cb();
        },
        create: function(className){
            this.elements.push({ className });
        },
        elements: [],
        querySelectorAll: function(){
            return this.elements;
        }
    }
};
browser.window.document = browser.document;

exports.browser = browser;

var ie8 = _.cloneDeep(browser);
ie8.document.attachEvent = ie8.document.addEventListener;
delete ie8.document.addEventListener;

exports.ie8 = ie8;


