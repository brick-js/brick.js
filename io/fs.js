var path = require('path');
var debug = require('debug')('brick:io/fs');
var BPromise = require("bluebird");
var fs = BPromise.promisifyAll(require("fs"));

function subdirs(dir) {
    return fs
        .readdirAsync(dir)
        .filter(fileName =>
            fs.statAsync(path.resolve(dir, fileName))
            .then(stat => stat.isDirectory()));
}

function subdirsSync(dir) {
    return fs
        .readdirSync(dir)
        .filter(fileName =>
            fs.statSync(path.resolve(dir, fileName)).isDirectory());
}

function existSync(path){
    try{
        fs.
            statSync(path);
        return true;
    }
    catch(e){
        return false;
    } 
}

module.exports = {
    read: path => fs.readFileAsync(path, 'utf8'),
    write: fs.writeFileAsync.bind(fs),
    readSync: path => fs.readFileSync(path, 'utf8'),
    stat: fs.statAsync.bind(fs),
    subdirs,
    subdirsSync,
    existSync
};

