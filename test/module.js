const env = require('./utils/env');
const expect = env.expect;
const mock = require('mock-fs');
const Module = require('../src/module.js');
const config = require('../src/config.js');
const fs = require('fs');
const stubs = require('./utils/stubs.js');
const sinon = require('sinon');
const mockRequire = require('mock-require');

describe('module', function() {
    var cfg, req, m;
    before(function() {
        req = {
            app: {
                locals: {}
            }
        };
        m = Module();
        mock({
            '/foo/router.js': 'exports.url="/"',
            '/bar/view.html': 'bar',
            '/empty': {},
            '/standard/view.html': 'foo',
            '/standard/router.js': 'this will not read by require'
        });
        mockRequire('/standard/router.js', {
            url: '',
            get: function() {}
        });
        cfg = config.factory({
            root: '/'
        });
    });
    after(function() {
        mock.restore();
        mockRequire.stopAll();
    });
    it('should load a simple module', function() {
        var mod = m.loadModule('/standard', cfg);
        expect(mod).to.have.property('id');
        expect(mod).to.have.property('template');
        expect(mod).to.have.property('router');
        expect(mod.router).to.have.property('url');
        expect(mod.router).to.have.property('get');
    });
    it('should load empty module', function() {
        var mod = m.loadModule('/empty', cfg);
        expect(mod.template).to.exist; // static tpl path for better performance
        expect(mod.router.url).to.not.exist;
    });
    it('should load all directories as modules', function() {
        var mods = m.loadAll(cfg);
        var n = fs.readdirSync('/').length;
        expect(mods.length).to.equal(n);
    });
    it('should use dirname as mid by default', function() {
        var mod = m.loadModule('/foo', cfg);
        expect(mod.id).to.equal('foo');
    });
    it('should use default context when no router present', function() {
        var mod = m.loadModule('/bar', cfg);
        return expect(mod.context({
            app: {}
        }, {})).to.be.fullfilled;
    });
    it('render should call renderer', function() {
        var mod = m.loadModule('/bar', cfg);
        var spy = sinon.spy(mod, 'renderer');
        var ctx = {
            foo: 'bar'
        };
        return mod.render(req, {}, ctx).then(function() {
            var args = spy.args[0];
            expect(args[0]).to.equal('/bar/view.html');
            expect(args[1]).to.deep.equal(ctx);
            expect(args[2]).to.be.a('function');
            expect(args[3]).to.equal('bar');
        });
    });
    it('should call render recursively', function() {
        var mod = m.loadModule('/bar', cfg);
        return expect(mod.render(req, {}, {}))
            .to.eventually.equal('bar');
    });
});
