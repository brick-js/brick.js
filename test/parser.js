const env = require('./utils/env');
const stubs = require('./utils/stubs');
const should = env.should;
const Path = require('path');
const config = require('../config.js');
const _ = require('lodash');
const parser = require('../src/parser.js');

describe('parser', function() {
    var cfg, path;
    before(function() {
        cfg = config.factory(stubs.brickConfig);
        path = Path.resolve(stubs.root, 'sample-module/package.json');
    });
    it('should parse package.json', function() {
        var pkg = parser.parsePackageFile(path);
        pkg.name.should.equal("sample-module");
        pkg.version.should.equal("1.0.0");
        pkg.view.should.equal('htmls/my-html.hbs');
        pkg.router.should.equal("svr.js");
    });
});

