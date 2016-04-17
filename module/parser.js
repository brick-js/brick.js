const Path = require('path');
const assert = require('assert');
const fs = require('../io/fs');
const changeCase = require('change-case');
const _ = require('lodash');
const debug = require('debug')('brick:module:parser');

var engines = {
    '.hbs': 'hbs',
    '.handlebars': 'hbs',
    '.liquid': 'liquid',
    '.ejs': 'ejs'
};
var processors = {
    '.less': 'less',
    '.stylus': 'stylus',
    '.sass': 'sass',
    '.scss': 'sass',
    ".coffee": 'coffee'
};
var parser = {};

parser.package = function(path, config) {
    config = _.cloneDeep(config);
    assert(config.css, config.html, config.client, config.server);

    var defaultPkg = _.pick(config, ['css', 'html', 'client', 'server']);
    var pkgPath = Path.resolve(path, 'package.json');
    var pkg = fs.existSync(pkgPath) ? require(pkgPath) : {};
    pkg = _.merge(normalize(defaultPkg), normalize(pkg));

    var name = changeCase.paramCase(Path.basename(path));
    if(pkg.name){
        assert(pkg.name, name);
    }
    else{
        pkg.name = name;
    }
    return pkg;
};

parser.server = function(pkg, path){
    path = Path.resolve(path, pkg.server.entry);
    if (fs.existSync(path)) {
        return require(path) || {};
    }
    else return {};
};

function normalize(pkg){
    assert(pkg);
    var html = pkg.html, css = pkg.css, server = pkg.server, client = pkg.client;

    if(html && html.entry){
        assert(typeof html.entry === 'string');
        html.engine = html.engine || engines[Path.extname(html.entry)] || 'html';
    }
    if(css && css.entry){
        assert(typeof css.entry === 'string');
        css.processor = css.processor || processors[Path.extname(css.entry)] || 'css';
    }
    if(client && client.entry){
        assert(typeof client.entry === 'string');
        client.processor = client.processor || processors[Path.extname(client.entry)] || 'js';
    }
    if(server && server.entry){
        assert(typeof server.entry === 'string');
        server.processor = server.processor || processors[Path.extname(server.entry)] || 'js';
    }
    return pkg;
}

module.exports = parser;
