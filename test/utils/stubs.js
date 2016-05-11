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
        return pctrl('simple', ctx).then(html => result);
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

exports.ctx = {
    foo: 'bar',
    bar: 123,
    arr: [1, 'ff']
};

