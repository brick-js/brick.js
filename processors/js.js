// built-in js processor
const fs = require('../io/fs');
const path = require('path');
const BPromise = require('bluebird');

var processor = {
    render: path => fs.read(path)
};

module.exports = processor;

