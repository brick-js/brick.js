const path = require('path');
const BPromise = require('bluebird');
const _ = require('lodash');

exports.brickConfig = {
    root: path.resolve(__dirname, '../cases'),
    view: 'view.html', 
    server: 'server.js'
};

exports.expressResponse = {
    set: function() {},
    status: function() {},
    end: function() {}
};

exports.hbs = {
    render: function(path, ctx, pmodularize, pctrl) {
        var result = '<div>hbs engine stub</div>';
        result = pmodularize(result);
        pctrl('sub-module', ctx);
        return BPromise.resolve(result);
    }
};

exports.stylus = {
    render: function(path, rootClass) {
        return BPromise.resolve(path + rootClass);
    }
};

exports.module = {
    id: 'mod'
};

