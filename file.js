var fs = require('fs');
var path = require('path');
var debug = require('debug')('brick:file');

function canRead(filepath) {
    try {
        fs.accessSync(filepath, fs.R_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function stat(path) {
    return new Promise((res, rej) => {
        fs.stat(path, (e, stats) => e ? rej(e) : res(stats));
    });
}

function read(filename) {
    return new Promise((res, rej) =>
        fs.readFile(filename, 'utf8', (e, data) => e ? rej(e) : res(data)));
}

function write(filename, data) {
    return new Promise((res, rej) =>
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
