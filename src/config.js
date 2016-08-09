const _ = require('lodash');
const process = require('process');
const path = require('path');
const debug = require('debug')('brick:config');

var config = {
    root: path.resolve(process.cwd(), 'bricks'),
    view: 'view.html',
    router: 'router.js',
    set: function(k, v) {
        this[k] = v;
        return this;
    },
    get: function(k) {
        return this[k];
    }
};

exports.factory = function(args){
    var cfg = _.merge({}, config, args);
    return cfg;
};

