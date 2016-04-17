const env = require('../utils/env');
const should = env.should;
const Path = require('path');
const stubs = require('../utils/stubs');
const Render = require('../../module/render.js');
const sinon = require('sinon');
const assert = require('assert');

describe('render', function() {
    describe('register', function() {
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
    });
    describe('factory', function() {
        before(function() {
            Render.register('liquid', stubs.hbs);
        });
        it('should do modularization', function() {
            var render = Render.factory('liquid');
            var result = '<div class="brk-a">hbs engine stub</div>';
            return render('a.hbs', {}, x => x, 'a')
                .should.eventually.equal(result);
        });
        it('should call pctrl', function() {
            var render = Render.factory('liquid');
            var ctx = {
                foo: 'bar'
            };
            var pctrl = sinon.spy();
            render('a.hbs', ctx, pctrl, 'a');
            return assert(pctrl.calledWith('sub-module', ctx));
        });
    });
    describe('linkStatic', function(){
        it('should link static', function(){
            var result = '<html><link rel="stylesheet" href="bar"><script src="foo"></script></html>';
            return Render.linkStatic('<html></html>', 'foo', 'bar')
                .should.equal(result);
        });
    });
});
