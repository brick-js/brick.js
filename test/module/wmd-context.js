const env = require('../utils/env');
const Render = require('../../module/render.js');
const stubs = require('../utils/stubs');
const wmd = require('../../module/wmd');
const render = require('../../module/render');
const config = require('../../config.js');
const _ = require('lodash');

describe('wmd-context', function() {
    var cfg, mods;
    before(function() {
        cfg = config.factory(stubs.brickConfig);
        mods = wmd.loadAll(cfg);
        Render.register('.hbs', stubs.hbs);
    });
    it('context should inherit parent context', function() {
        var mod = wmd.get('simple');
        var result = _.cloneDeep(stubs.ctx);
        result.title = 'am title';
        return mod.context(stubs.req, stubs.res, stubs.ctx)
            .should.eventually.deep.equal(result);
    });
    it('context should inherit app.locals', function() {
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
        return wmd.get('simple').context(req, stubs.res, {})
            .should.eventually.deep.equal(result);
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
        return wmd.get('simple').context(req, stubs.res, parent)
            .should.eventually.deep.equal(result);
    });
    it('view controller should override parent context', function() {
        var parent = {
            title: 'am parent'
        };
        var result = {
            title: 'am title'
        };
        return wmd.get('simple').context(stubs.req, stubs.res, parent)
            .should.eventually.deep.equal(result);
    });
});
