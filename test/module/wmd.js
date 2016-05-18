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

describe('wmd', function() {
    var cfg, mods;
    before(function() {
        cfg = config.factory(stubs.brickConfig);
        mods = wmd.loadAll(cfg);
        Render.register('.hbs', stubs.hbs);
    });
    it('should handle normal router', function() {
        var router = wmd.get('sample-module').router;
        return should.exist(router.url) &&
            should.exist(router.get);
    });
    it('should handle empty router', function() {
        var router = wmd.get('incom-plete').router;
        return should.exist(router) &&
            should.not.exist(router.url);
    });
    it('should parse dirname as mid', function() {
        return wmd.get('incom-plete').id.should.equal('incom-plete');
    });
    it('should accept array of views', function() {
        var _cfg = _.cloneDeep(cfg);
        _cfg.view = ['view.html', 'index.html'];
        wmd.loadAll(_cfg);
        wmd.get('simple').template.should.contain('index.html');
    });
    it('should load all mods', function() {
        var n = fs.readdirSync(stubs.root).length;
        return mods.length.should.equal(n);
    });
    it('should load empty', function() {
        var mod = wmd.get('fs');
        should.exist(mod.template);
        should.not.exist(mod.router.url);
    });
    it('should load simple', function() {
        var mod = wmd.get('simple');
        var file = Path.resolve(stubs.brickConfig.root, 'simple/index.css');
        mod.should.have.property('id');
        mod.should.have.property('template');
        mod.should.have.property('router');
        mod.router.should.have.property('url');
        mod.router.should.have.property('get');
    });
    it('should throw when rendering null template', function() {
        var mod = wmd.get('fs');
        mod.render.should.throw();
    });
    it('should use default context when no router present', function() {
        var mod = wmd.get('incom-plete');
        return mod.context(stubs.req).should.be.fullfilled;
    });
    it('render should call renderer', function(){
        var mod = wmd.get('sample-module');
        var spy = sinon.spy(mod, 'renderer'); 
        var tpl = Path.resolve(__dirname, '../cases/sample-module/htmls/my-html.hbs');
        var ctx = {foo: 'bar'};
        return mod.render(stubs.req, stubs.res, ctx).then(function(){
            var args = spy.args[0];
            args[0].should.equal(tpl);
            args[1].should.deep.equal(ctx);
            args[2].should.be.a('function');
            args[3].should.equal('sample-module');
        });
    });
    it('render should be called recursively', function(){
        var mod = wmd.get('sample-module');
        var res = '<stub>simple-stub\n</stub>';
        return mod.render(stubs.req, stubs.res, stubs.ctx).should.eventually.equal(res);
    });
});
