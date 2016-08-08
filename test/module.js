const env = require('./utils/env');
const expect = env.expect;
const mock = require('mock-fs');
const m = require('../src/module.js');
const config = require('../config.js');
const stubs = require('./utils/stubs.js');
const sinon = require('sinon');

describe('module', function() {
    var cfg;
    before(function(){
        mock({
            '/foo/router.js': 'exports.url="/"',
            '/bar/view.html': 'bar'
        });
        cfg = config.factory({
            root: '/'
        });
    });
    after(function() {
        mock.restore();
    });
    it('should use dirname as mid by default', function() {
        var mod = m.loadModule('/foo', cfg);
        expect(mod.id).to.equal('foo');
    });
    it('should use default context when no router present', function() {
        var mod = m.loadModule('/bar', cfg);
        return expect(mod.context(stubs.req, stubs.res)).to.be.fullfilled;
    });
    it('render should call renderer', function() {
        var mod = m.loadModule('/bar', cfg);
        var spy = sinon.spy(mod, 'renderer');
        var ctx = {
            foo: 'bar'
        };
        return mod.render(stubs.req, stubs.res, ctx).then(function() {
            var args = spy.args[0];
            expect(args[0]).to.equal('/bar/view.html');
            expect(args[1]).to.deep.equal(ctx);
            expect(args[2]).to.be.a('function');
            expect(args[3]).to.equal('bar');
        });
    });
    it('render should be called recursively', function() {
        var mod = m.loadModule('/bar', cfg);
        return expect(mod.render(stubs.req, stubs.res, stubs.ctx))
            .to.eventually.equal('bar');
    });
});
