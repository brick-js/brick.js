/*jslint evil: true */

const env = require('../utils/env');
const should = env.should;
const Path = require('path');
const fs = require('../../io/fs');
const stubs = require('../utils/stubs');
const _ = require('lodash');
const sinon = require('sinon');
const assert = require('assert');

describe('common.js', function() {
    var browser, src;
    before(function(){
        browser = _.cloneDeep(stubs.browser);
        window = browser.window;
        document = browser.window.document;
        document.create('brk-simple-mod');
        src = fs.readSync(Path.resolve(__dirname, '../../assets/common.js'));
        eval(src);
    });
    it('run as DOM ready', function() {
        return should.exist(browser.document.events.DOMContentLoaded);
    });
    it('should load module', function(){
        var spy = sinon.spy();
        window.brick.register('simple-mod', spy);
        document.load();
        return assert(spy.called);
    });
    it('should resolve module.exports', function(){
        var exports = {foo: 'bar'};
        window.brick.register('simple-mod', (r, e, m) => 
            r('dep').should.deep.equal(exports));
        window.brick.register('dep', (r, e, m) => m.exports = exports);
        document.load();
    });
    it('should resolve exports', function(){
        window.brick.register('simple-mod', (r, e, m) => 
            r('dep').foo.should.equal('bar'));
        window.brick.register('dep', (r, e, m) => e.foo = 'bar');
        document.load();
    });
    describe('CommonJS (Node.js styled) compliance', function(){
        it('should have correct id property', function(){
            window.brick.register('simple-mod', (r, e, m) => 
                m.id.should.equal('simple-mod'));
            document.load();
        });
        it('should have correct loaded property', function(){
            window.brick.register('simple-mod', (r, e, m) => 
                r('dep').module.loaded.should.equal(true));
            window.brick.register('dep', (r, e, m) => {
                e.module = m;
                m.loaded.should.equal(false);
            });
            document.load();
        });
        it('should have correct parent/children property', function(){
            window.brick.register('simple-mod', (r, e, m) => {
                r('dep').module.parent.should.equal(m);
                m.children.should.have.length(1);
                m.children[0].should.equal(r('dep').module);
            });
            window.brick.register('dep', (r, e, m) => {
                e.module = m;
            });
            document.load();
        });
        it('should handle syclic require', function(){
            window.brick.register('simple-mod', (r, e, m) => {
                e.foo = 'foo';
                r('dep').foo.should.equal('foo');
                r('dep').bar.should.equal('bar');
                e.bar = 'bar';
            });
            window.brick.register('dep', (r, e, m) => {
                e.foo = 'foo';
                r('simple-mod').foo.should.equal('foo');
                should.not.exist(r('simple-mod').bar);
                e.bar = 'bar';
            });
            document.load();
        });
    });
    describe('ie8', function(){
        before(function(){
            browser = _.cloneDeep(stubs.ie8);
            window = browser.window;
            document = browser.window.document;
            eval(src);
        });
        it('run as DOM ready', function() {
            return should.exist(browser.document.events.onreadystatechange);
        });
    });
});
