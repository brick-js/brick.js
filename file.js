var fs = require('fs');
var path   = require('path');
var debug = require('debug')('brick:file');

function canRead(filepath) {
    try{
        fs.accessSync(filepath, fs.R_OK);
        return true;
    }
    catch(e){
        return false;
    }
}

function readFileSafe(filepath) {
    try {
        return fs.readFileSync(filepath);
    }
    catch (e) {
        return '';
    }
}

function resolvePath(dir, filename) {
    return path.resolve(path.join(dir, filename));
}

function subDirectories(dir) {
    var ret = [];
    fs.readdirSync(dir).forEach(function (entry) {
        var filepath = path.resolve(path.join(dir, entry));
        var stats = fs.statSync(filepath);
        if(stats.isDirectory()) ret.push({path: filepath, name: entry});
    });
    return ret;
}

module.exports = {
    canRead: canRead,
    readFileSafe: readFileSafe,
    resolvePath: resolvePath,
    subDirectories: subDirectories
};
