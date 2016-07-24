const env = require('./utils/env');
const Render = require('../src/render.js');
const should = env.should;
const expect = env.expect;
const fs = require('fs');
const Path = require('path');
const sinon = require('sinon');
const stubs = require('./utils/stubs');
const wmd = require('../src/module.js');
const render = require('../src/render');
const config = require('../config.js');
const _ = require('lodash');

describe('render', function() {
    beforeEach(function() {
        wmd.clear();
        mods = wmd.loadAll(config.factory(stubs.brickConfig));
        Render.register('.hbs', stubs.hbs);
    });
    it('should not accept a string', function() {
        (function() {
            Render.register('hbs', 'not valid');
        }).should.throw();
    });
    it('should accept a function', function() {
        (function() {
            Render.register('hbs', stubs.hbs);
        }).should.not.throw();
    });
    it('should provide default .html renderer', function() {
        Render.get('.html').should.be.a('function');
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
        return mod.context(stubs.req, stubs.res).should.be.fullfilled;
    });
    it('render should call renderer', function() {
        var mod = wmd.get('sample-module');
        var spy = sinon.spy(mod, 'renderer');
        var tpl = Path.resolve(__dirname, './cases/sample-module/htmls/my-html.hbs');
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
    it('should render html by default', function() {
        var f = Path.resolve(__dirname, './cases/inCom_plete/view.html');
        return Render.get('.html')(f).should.eventually.equal('Hello!\n');
    });
    it('should call pctrl', function() {
        Render.register('.liquid', stubs.hbs);
        var ctx = {
            foo: 'bar'
        };
        var pctrl = sinon.spy(stubs.pctrl);
        Render.get('.liquid')('a.liquid', ctx, pctrl, 'a');
        return expect(pctrl.calledWith('simple', ctx)).to.equal(true);
    });
    it('should modularize html', function() {
        var src = '<!DOCTYPE\n html> \t\n<div></div>';
        var res = '<!DOCTYPE\n html> \t\n<div class="brk-nav-bar"></div>';
        Render.modularize('nav-bar', src).should.equal(res);
    });
    it('should modularize text', function() {
        var src = 'text';
        var res = "<div class='brk-nav-bar'>text</div>";
        Render.modularize('nav-bar', src).should.equal(res);
    });
    it('modularize should respect existing attributes', function() {
        var src = '<span id="foo"></span>';
        var res = '<span class="brk-nav-bar" id="foo"></span>';
        Render.modularize('nav-bar', src).should.equal(res);
    });
    it('modularize should respect existing classNames', function() {
        var src = '<span id="" class="a b"></span>';
        var res = '<span id="" class="brk-nav-bar a b"></span>';
        Render.modularize('nav-bar', src).should.equal(res);
    });
});
