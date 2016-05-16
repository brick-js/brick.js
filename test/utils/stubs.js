const path = require('path');
const BPromise = require('bluebird');
const _ = require('lodash');

exports.brickConfig = {
    root: path.resolve(__dirname, '../cases'),
    view: 'view.html',
    router: 'router.js'
};

exports.expressResponse = {
    set: function() {},
    status: function() {},
    end: function() {}
};

exports.hbs = {
    render: function(path, ctx, pmodularize, pctrl) {
        return pctrl('simple', ctx)
            .then(html => '<stub>' + html + '</stub>');
    }
};

exports.pctrl = function() {
    return BPromise.resolve('<html>Stub</html>');
};

exports.stylus = {
    render: function(path, rootClass) {
        return BPromise.resolve(path + rootClass);
    }
};

exports.module = {
    id: 'mod'
};

exports.req = {
    app: {
        locals: {}
    }
};

exports.res = {
    render: function(){},
    end: function(){}
};

exports.ctx = {
    foo: 'bar',
    bar: 123,
    arr: [1, 'ff']
};

exports.root = path.resolve(__dirname, '../cases');
