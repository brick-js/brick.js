const env = require('./utils/env');
const expect = env.expect;
const Render = require('../src/render.js');
const stubs = require('./utils/stubs');
const wmd = require('../src/module');
const render = require('../src/render');
const config = require('../config.js');
const _ = require('lodash');
const mockFs = require('mock-fs');
const mockRequire = require('mock-require');

describe('context', function() {
    var cfg, mods;
    before(function() {
        mockFs({
            '/foo/view.html': 'foo',
            '/reflect/router.js': 'this will not be used by require',
            '/simple/router.js': 'this will not be used by require'
        });
        mockRequire('/simple/router.js', {
            get: (req, res) => res.render({
                title: 'am title'
            })
        });
        mockRequire('/reflect/router.js', {
            get: (req, res) => res.render(res.locals)
        });

        mods = wmd.loadAll(config.factory({
            root: '/'
        }));
        Render.register('.hbs', stubs.hbs);
    });
    after(function() {
        mockFs.restore();
        mockRequire.stopAll();
    });
    it('should inherit parent context', function() {
        var mod = wmd.get('simple');
        return expect(mod.context(stubs.req, {}, {
            parent: 'none'
        })).to.eventually.deep.equal({
            parent: 'none',
            title: 'am title'
        });
    });
    it('should inherit app.locals', function() {
        var req = {
            app: {
                locals: {
                    content: 'am content'
                }
            }
        };
        var result = {
            title: 'am title',
            content: 'am content'
        };
        return expect(wmd.get('simple').context(req, {}, {}))
            .to.eventually.deep.equal(result);
    });
    it('res.locals should override app.locals', function() {
        var req = {
            app: {
                locals: {
                    content: 'from app.locals'
                }
            }
        };
        var res = {
            locals: {
                content: 'from res.locals'
            }
        };
        return expect(wmd.get('simple').context(req, res, {}))
            .to.eventually.deep.equal({
                title: 'am title',
                content: 'from res.locals'
            });
    });

    it('parent context should override app.locals', function() {
        var req = {
            app: {
                locals: {
                    content: 'am content'
                }
            }
        };
        var parent = {
            content: 'am parent'
        };
        var result = {
            title: 'am title',
            content: 'am parent'
        };
        return expect(wmd.get('simple').context(req, {}, parent))
            .to.eventually.deep.equal(result);
    });
    it('view controller should override parent context', function() {
        var parent = {
            title: 'from parent'
        };
        return expect(wmd.get('simple').context(stubs.req, {}, parent))
            .to.eventually.deep.equal({
                title: 'am title'
            });
    });
    it('should handle done(undefined)', function() {
        var mod = wmd.get('foo');
        return expect(mod.context(stubs.req, {}, stubs.ctx))
            .to.eventually.deep.equal(stubs.ctx);
    });
    it('should pass context as this', function() {
        var mod = wmd.get('reflect');
        var ctx = {
            foo: 'bar'
        };
        return expect(mod.context(stubs.req, {}, ctx))
            .to.eventually.deep.equal(ctx);
    });
});
