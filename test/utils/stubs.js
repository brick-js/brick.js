const path = require('path');
const BPromise = require('bluebird');

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
    render: function(path, ctx, pctrl){
        pctrl('sub-module', ctx);
        return BPromise.resolve('<div>hbs engine stub</div>');
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

