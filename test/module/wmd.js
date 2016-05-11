const env = require('../utils/env');
const Render = require('../../module/render.js');
const should = env.should;
const assert = require('assert');
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
    it('should accept array of views', function() {
        var _cfg = _.cloneDeep(cfg);
        _cfg.view = ['view.html', 'index.html'];
        wmd.loadAll(_cfg);
        var mod = wmd.get('simple');
        mod.html.should.contain('index.html');
    });
    it('should load all mods', function() {
        return mods.length.should.equal(4);
    });
    it('should load empty', function() {
        var mod = wmd.get('fs');
        should.not.exist(mod.css || mod.html ||
            mod.client || mod.url);
    });
    it('should load simple', function() {
        var mod = wmd.get('simple');
        var file = Path.resolve(stubs.brickConfig.root, 'simple/index.css');
        mod.should.have.property('html');
        mod.should.have.property('url');
        mod.should.have.property('render');
        mod.should.have.property('id');
    });
    it('should throw when rendering null template', function() {
        var mod = wmd.get('fs');
        mod.ctrl.should.throw();
    });
    it('should use default resolver when no server.js present', function() {
        var mod = wmd.get('incom-plete');
        return mod.context(stubs.req).should.be.fullfilled;
    });
    it('ctrl should call render', function(){
        var mod = wmd.get('sample-module');
        var spy = sinon.spy(mod, 'render'); 
        var f = Path.resolve(__dirname, '../cases/sample-module/htmls/my-html.hbs');
        var ctx = {foo: 'bar'};
        return mod.ctrl(stubs.req, ctx).then(function(){
            var args = spy.args[0];
            args[0].should.equal(f);
            args[1].should.deep.equal(ctx);
            args[2].should.be.a('function');
            args[3].should.equal('sample-module');
        });
    });
    it('ctrl should be called recursively', function(){
        var mod = wmd.get('sample-module');
        var res = '<stub>simple-stub\n</stub>';
        return mod.ctrl(stubs.req, stubs.ctx).should.eventually.equal(res);
    });
    it('should handle done(undefined)', function() {
        var mod = wmd.get('sample-module');
        return mod.context(stubs.req, stubs.ctx)
            .should.eventually.deep.equal(stubs.ctx);
    });
    it('context should inherit parent context', function() {
        var mod = wmd.get('simple');
        var result = _.cloneDeep(stubs.ctx);
        result.title = 'am title';
        return mod.context(stubs.req, stubs.ctx)
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
        return wmd.get('simple').context(req, {})
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
        return wmd.get('simple').context(req, parent)
            .should.eventually.deep.equal(result);
    });
    it('view controller should override parent context', function() {
        var parent = {
            title: 'am parent'
        };
        var result = {
            title: 'am title'
        };
        return wmd.get('simple').context(stubs.req, parent)
            .should.eventually.deep.equal(result);
    });
});
