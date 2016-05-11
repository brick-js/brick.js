const Path = require('path');
const assert = require('assert');
const fs = require('../io/fs');
const _ = require('lodash');
const debug = require('debug')('brick:module:parser');

var parser = {};

parser.package = function(path, config) {
    config = _.cloneDeep(config);
    assert(config.view, config.server);

    var pkgPath = Path.resolve(path, 'package.json');
    var pkg = fs.existSync(pkgPath) ? require(pkgPath) : {};

    pkg = _.merge(config, pkg);

    var name = normalize(Path.basename(path));
    if(pkg.name){
        assert(pkg.name, name);
    }
    else{
        pkg.name = name;
    }
    return pkg;
};

parser.server = function(pkg, path){
    path = Path.resolve(path, pkg.server);
    if (fs.existSync(path)) {
        return require(path) || {};
    }
    else return {};
};

function normalize(id){
    var res = id.toLowerCase().replace(/[^a-z]+/g, '-');
    if(id !== res){
        debug(`brick "${id}" better be hyphen-separated and lowercased`);
    }
    return res;
}

module.exports = parser;
