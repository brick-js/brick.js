var fs = require('fs');
var path = require('path');
var debug = require('debug')('brick:file');
var isSafe = { 'ENOENT': true };
var Bluebird = require('bluebird');

function canRead(filepath) {
    try {
        fs.accessSync(filepath, fs.R_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function stat(path) {
    return new Bluebird((res, rej) => {
        fs.stat(path, (e, stats) => e ? rej(e) : res(stats));
    });
}

function read(path) {
    return new Bluebird((res, rej) =>
        fs.readFile(path, 'utf8', (e, data) => 
            !e || isSafe[e.code] ? res(data || '') : rej(e)));
}

function write(filename, data) {
    return new Bluebird((res, rej) =>
        fs.writeFile(filename, data, 'utf8', e => e ? rej(e) : res()));
}

function subDirectories(dir) {
    var ret = [];
    fs.readdirSync(dir).forEach(function(entry) {
        var filepath = path.resolve(path.join(dir, entry));
        var stats = fs.statSync(filepath);
        if (stats.isDirectory()) ret.push(entry);
    });
    return ret;
}

module.exports = {
    canRead,
    subDirectories,
    stat,
    read,
    write
};
