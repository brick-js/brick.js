var file = require('./file');
var serverFileName = 'server.js';
var clientFileName = 'client.js';
var tplFileName = 'index.html';
var changeCase = require('change-case');
var modules = {};
var debug = require('debug')('brick:module');
var count = 0;

function Module(config) {
    debug('init module:', config.name);
    var path = config.path;

    this.id = count++;
    this.name = changeCase.camelCase(config.name);
    modules[this.name] = this;

    this.serverPath = file.resolvePath(path, serverFileName);
    this.clientPath = file.resolvePath(path, clientFileName);
    this.tplPath = file.resolvePath(path, tplFileName);
    this.tplDir = config.name + '/' + tplFileName;

    if (file.canRead(this.serverPath)) {
        var server = require(this.serverPath) || {};
        this.url = server.url;
        this.view = server.view;
    }
}

exports.Module = Module;
exports.factory = function(config) {
    return new Module(config);
};
exports.load = function(path) {
    debug('loading modules:', path);
    modules = {};
    count = 0;
    file.subDirectories(path).forEach(exports.factory);
    debug(count, 'modules loaded');
    return modules;
};
exports.get = function(mid){
    return modules[mid];
};
