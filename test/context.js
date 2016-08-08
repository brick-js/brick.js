const env = require('./utils/env');
const expect = env.expect;
const Render = require('../src/render.js');
const stubs = require('./utils/stubs');
const wmd = require('../src/module');
const render = require('../src/render');
const config = require('../config.js');
const _ = require('lodash');

describe('context', function() {
    var cfg, mods;
    before(function() {
        cfg = config.factory(stubs.brickConfig);
        mods = wmd.loadAll(cfg);
        Render.register('.hbs', stubs.hbs);
    });
    it('should inherit parent context', function() {
        var mod = wmd.get('simple');
        var result = _.cloneDeep(stubs.ctx);
        result.title = 'am title';
        return expect(mod.context(stubs.req, stubs.res, stubs.ctx))
            .to.eventually.deep.equal(result);
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
        return expect(wmd.get('simple').context(req, stubs.res, {}))
            .to.eventually.deep.equal(result);
    });
    it('should inherit res.locals', function() {
        var req = {
            app: {
                locals: {
                    content: 'am content'
                }
            }
        };
        var res = {
            locals: {
                content: 'am content from res'
            }
        };
        var result = {
            title: 'am title',
            content: 'am content from res'
        };
        return expect(wmd.get('simple').context(req, res, {}))
            .to.eventually.deep.equal(result);
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
        return expect(wmd.get('simple').context(req, stubs.res, parent))
            .to.eventually.deep.equal(result);
    });
    it('view controller should override parent context', function() {
        var parent = {
            title: 'am parent'
        };
        var result = {
            title: 'am title'
        };
        return expect(wmd.get('simple').context(stubs.req, stubs.res, parent))
            .to.eventually.deep.equal(result);
    });
});
