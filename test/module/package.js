const env = require('../utils/env');
const should = env.should;
const Path = require('path');
const parser = require('../../module/parser');
const stubs = require('../utils/stubs');
const config = require('../../config.js');

var root = Path.resolve(__dirname, '../cases');
var samplePath = Path.resolve(root, 'sample-module');
var incompletePath = Path.resolve(root, 'inCom_plete');

describe('package', function() {
    var cfg = config.factory(stubs.brickConfig);

    var samplePkg = parser.package(samplePath, cfg);
    var incompletePkg = parser.package(incompletePath, cfg);

    var sampleServer = parser.server(samplePkg, samplePath);
    var incompleteServer = parser.server(incompletePkg, samplePath);

    it('should respect entry(html)', function() {
        return samplePkg.view.should.equal('htmls/my-html.hbs');
    });
    it('should handle undefined name', function() {
        return incompletePkg.name.should.equal('incom-plete');
    });
});
