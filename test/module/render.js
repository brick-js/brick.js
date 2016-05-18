const env = require('../utils/env');
const Render = require('../../module/render.js');
const should = env.should;
const fs = require('fs');
const Path = require('path');
const sinon = require('sinon');
const stubs = require('../utils/stubs');
const wmd = require('../../module/wmd');
const render = require('../../module/render');
const config = require('../../config.js');
const _ = require('lodash');

describe('render', function() {
    before(function() {
        wmd.clear();
        mods = wmd.loadAll(config.factory(stubs.brickConfig));
        Render.register('.hbs', stubs.hbs);
    });
    it('should handle normal router', function() {
        var router = wmd.get('sample-module').router;
        should.exist(router.url);
        should.exist(router.get);
    });
    it('should handle empty router', function() {
        var router = wmd.get('incom-plete').router;
        should.exist(router);
        should.not.exist(router.url);
    });
    it('should parse dirname as mid', function() {
        wmd.get('incom-plete').id.should.equal('incom-plete');
    });
    it('should throw when rendering null template', function() {
        var mod = wmd.get('fs');
        mod.render.should.throw();
    });
    it('should use default context when no router present', function() {
        var mod = wmd.get('incom-plete');
        return mod.context(stubs.req).should.be.fullfilled;
    });
    it('render should call renderer', function() {
        var mod = wmd.get('sample-module');
        var spy = sinon.spy(mod, 'renderer');
        var tpl = Path.resolve(__dirname, '../cases/sample-module/htmls/my-html.hbs');
        var ctx = {
            foo: 'bar'
        };
        return mod.render(stubs.req, stubs.res, ctx).then(function() {
            var args = spy.args[0];
            args[0].should.equal(tpl);
            args[1].should.deep.equal(ctx);
            args[2].should.be.a('function');
            args[3].should.equal('sample-module');
        });
    });
    it('render should be called recursively', function() {
        var mod = wmd.get('sample-module');
        var res = '<stub>simple-stub\n</stub>';
        return mod.render(stubs.req, stubs.res, stubs.ctx).should.eventually.equal(res);
    });
});
