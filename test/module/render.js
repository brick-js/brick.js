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
        it('should call pctrl', function() {
            var render = Render.factory('liquid');
            var ctx = {
                foo: 'bar'
            };
            var pctrl = sinon.spy();
            render('a.hbs', ctx, pctrl, 'a');
            return assert(pctrl.calledWith('sub-module', ctx));
        });
        it('should modularize html', function() {
            var src = '\n  \t\n<div></div>';
            var res = '<div class="brk-nav-bar"></div>';
            Render.modularize('navBar', src).should.equal(res);
        });
        it('modularize should respect existing attributes', function() {
            var src = '<span id="foo"></span>';
            var res = '<span class="brk-nav-bar" id="foo"></span>';
            Render.modularize('navBar', src).should.equal(res);
        });
        it('modularize should respect existing classNames', function() {
            var src = '<span id="" class="a b"></span>';
            var res = '<span id="" class="brk-nav-bar a b"></span>';
            Render.modularize('navBar', src).should.equal(res);
        });
    });
    describe('linkStatic', function(){
        var link = '<link rel="stylesheet" href="bar">';
        var script = '<script src="foo"></script>';

        it('should handle empty <html>', function(){
            return Render.linkStatic('<html></html>', 'foo', 'bar')
                .should.equal(`<html>${link}${script}</html>`);
        });
        it('should handle plain text', function(){
            var src = 'this is text';
            return Render.linkStatic(src, 'foo', 'bar').should.equal(src);
        });
        it('should handle null <head>', function(){
            var src = '<html><body></body></html>';
            var res = `<html><body>${link}${script}</body></html>`;
            return Render.linkStatic(src, 'foo', 'bar').should.equal(res);
        });
        it('should handle normal <html>', function(){
            var src = '<html><head><meta charset="utf-8"></head><body></body></html>';
            var res = `<html><head><meta charset="utf-8">${link}</head><body>${script}</body></html>`;
            return Render.linkStatic(src, 'foo', 'bar').should.equal(res);
        });
        it('should handle null <head>', function(){
            var src = '<html><body></body></html>';
            var res = `<html><body>${link}${script}</body></html>`;
            return Render.linkStatic(src, 'foo', 'bar').should.equal(res);
        });
        it('should handle null <body>', function(){
            var src = '<html><head></head></html>';
            var res = `<html><head>${link}${script}</head></html>`;
            return Render.linkStatic(src, 'foo', 'bar').should.equal(res);
        });
    });
});
