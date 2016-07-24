const env = require('./utils/env');
const Render = require('../src/render.js');
const Path = require('path');
const stubs = require('./utils/stubs');
const wmd = require('../src/module.js');
const render = require('../src/render');
const config = require('../config.js');
const _ = require('lodash');

describe('resolver', function() {
    var cfg, mods;
    before(function() {
        cfg = config.factory(stubs.brickConfig);
        mods = wmd.loadAll(cfg);
        Render.register('.hbs', stubs.hbs);
    });
    it('should handle done(undefined)', function() {
        var mod = wmd.get('sample-module');
        return mod.context(stubs.req, stubs.res, stubs.ctx)
            .should.eventually.deep.equal(stubs.ctx);
    });
    it('should pass context as this', function() {
        var mod = wmd.get('reflect-context');
        var ctx = {};
        return mod.context(stubs.req, stubs.res, ctx)
            .should.eventually.equal(ctx);
    });
    it('should handle fail(404)', function() {
        var mod = wmd.get('fail-with-404');
        var p  = mod.context(stubs.req, stubs.res, {});
        return p.should.be.rejectedWith(Error, 'Not Found') &&
            p.catch(e => e.status.should.equal(404));
    });
});
