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
        return samplePkg.html.entry.should.equal('htmls/my-html.hbs');
    });
    it('should respect processor(css)', function() {
        return samplePkg.css.processor.should.equal('stylus');
    });
    it('should normalize engine', function() {
        return samplePkg.html.engine.should.equal('hbs');
    });
    it('should normalize processor(server)', function() {
        return samplePkg.server.processor.should.equal('js');
    });
    it('should handle undefined name', function() {
        return incompletePkg.name.should.equal('in-com-plete');
    });
    it('should handle engine without entry', function() {
        return incompletePkg.html.engine.should.equal('my-engine') &&
            incompletePkg.html.entry.should.equal('index.html');
    });
    it('should handle processor without entry', function() {
        return incompletePkg.client.processor.should.equal('my-proc') &&
            incompletePkg.client.entry.should.equal('client.js');
    });
    it('should handle undefined css', function() {
        return incompletePkg.css.processor.should.equal('css') &&
            incompletePkg.css.entry.should.equal('index.css');
    });
});
