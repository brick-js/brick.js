const env = require('./utils/env');
const Render = require('../src/render.js');
const expect = env.expect;
const Path = require('path');
const sinon = require('sinon');
const stubs = require('./utils/stubs');
const wmd = require('../src/module.js');
const render = require('../src/render');
const config = require('../config.js');
const _ = require('lodash');
const mock = require('mock-fs');

describe('render', function() {
    before(function(){
        mock({
            '/foo/sample/router.js': 'exports.url="/";\nexports.get=function(){}',
            '/foo/sample/view.html': 'Hello!'
        });
    });
    after(function() {
        mock.restore();
    });
    beforeEach(function() {
        wmd.clear();
        mods = wmd.loadAll(config.factory({
            root: '/foo'
        }));
        Render.register('.hbs', stubs.hbs);
    });
    it('should not accept a string', function() {
        expect(function() {
            Render.register('hbs', 'not valid');
        }).to.throw();
    });
    it('should accept a function', function() {
        expect(function() {
            Render.register('hbs', stubs.hbs);
        }).to.not.throw();
    });
    it('should provide default .html renderer', function() {
        expect(Render.get('.html')).to.be.a('function');
    });
    it('should render html by default', function() {
        var f = '/foo/sample/view.html';
        expect(Render.get('.html')(f)).to.eventually.equal('Hello!');
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
        expect(Render.modularize('nav-bar', src)).to.equal(res);
    });
    it('should modularize text', function() {
        var src = 'text';
        var res = "<div class='brk-nav-bar'>text</div>";
        expect(Render.modularize('nav-bar', src)).to.equal(res);
    });
    it('modularize should respect existing attributes', function() {
        var src = '<span id="foo"></span>';
        var res = '<span class="brk-nav-bar" id="foo"></span>';
        expect(Render.modularize('nav-bar', src)).to.equal(res);
    });
    it('modularize should respect existing classNames', function() {
        var src = '<span id="" class="a b"></span>';
        var res = '<span id="" class="brk-nav-bar a b"></span>';
        expect(Render.modularize('nav-bar', src)).to.equal(res);
    });
});
