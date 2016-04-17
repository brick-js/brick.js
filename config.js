const _ = require('lodash');
const process = require('process');
const path = require('path');

var config = {
    root: path.resolve(process.cwd(), 'modules'),
    html: {
        entry: 'index.html'
    },
    css: {
        entry: 'index.css'
    },
    client: {
        entry: 'client.js'
    },
    server: {
        entry: 'server.js'
    },
    static: {
        css: {
            url: '/104097114116116108101.css',
            file: false,
            comment: '/* module: %s */'
        },
        js: {
            url: '/104097114116116108101.js',
            file: false,
            comment: '// module: %s'
        }
    },
    set: function(k, v) {
        this[k] = v;
        return this;
    },
    get: function(k) {
        return this[k];
    }
};

function factory(args) {
    return _.merge({}, config, args);
}

exports.factory = factory;
