const env = require('./utils/env');
const stubs = require('./utils/stubs');
const expect = env.expect;
const Path = require('path');
const config = require('../src/config.js');
const _ = require('lodash');
const parser = require('../src/parser.js');
const mockRequire = require('mock-require');
const mockFs = require('mock-fs');

describe('parser', function() {
    beforeEach(function() {
        mockFs({
            '/foo/index.html': '',
            '/bar/view.html': '',
            '/router.js': ''
        });
        mockRequire('/package.json', {
            "name": "sample-module",
            "version": "1.0.0",
            "view": "htmls/my-html.hbs",
            "router": "svr.js"
        });
        mockRequire('/router.js', {
            url: '/foo',
            get: function() {}
        });
    });
    afterEach(function() {
        mockRequire.stopAll();
    });
    it('should resolve array of views', function() {
        var pkg = {
            view: ['view.html', 'index.html']
        };
        expect(parser.parseTemplate('/foo', pkg)).to.contain('index.html');
        expect(parser.parseTemplate('/bar', pkg)).to.contain('view.html');
    });
    it('should parse package.json', function() {
        var pkg = parser.parsePackageFile('/package.json');
        expect(pkg.name).to.equal("sample-module");
        expect(pkg.version).to.equal("1.0.0");
        expect(pkg.view).to.equal('htmls/my-html.hbs');
        expect(pkg.router).to.equal("svr.js");
    });

    it('should parse normal router', function() {
        var router = parser.parseRouter('/router.js');
        expect(router.url).to.exist;
        expect(router.get).to.exist;
    });

    it('should parse empty router', function() {
        var router = parser.parseRouter('/not-exist-router.js');
        expect(router.url).to.not.exist;
        expect(router).to.exist;
    });
});
