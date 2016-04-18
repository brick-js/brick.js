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

