const env = require('../utils/env');
const should = env.should;
const Path = require('path');
const stubs = require('../utils/stubs');
const Render = require('../../module/render.js');
const sinon = require('sinon');
const assert = require('assert');

describe('render', function() {
    before(function() {
        Render.register('.liquid', stubs.hbs);
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
    it('should call pctrl', function() {
        var render = Render.get('.liquid');
        var ctx = {
            foo: 'bar'
        };
        var pctrl = sinon.spy();
        render('a.hbs', ctx, pctrl, 'a');
        return assert(pctrl.calledWith('sub-module', ctx));
    });
    it('should modularize html', function() {
        var src = '<!DOCTYPE\n html> \t\n<div></div>';
        var res = '<!DOCTYPE\n html> \t\n<div class="brk-nav-bar"></div>';
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
