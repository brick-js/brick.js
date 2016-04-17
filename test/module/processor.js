const env = require('../utils/env');
const should = env.should;
const Path = require('path');
const stubs = require('../utils/stubs');
const processor = require('../../module/processor.js');
const sinon = require('sinon');
const assert = require('assert');

describe('processor', function() {
    describe('register', function() {
        it('should not accept a string', function() {
            (function() {
                processor.register('stylus', 'not valid');
            }).should.throw();
        });
        it('should accept a function', function() {
            (function() {
                processor.register('stylus', stubs.stylus);
            }).should.not.throw();
        });
    });
    describe('factory', function() {
        before(function() {
            processor.register('less', stubs.stylus);
        });
        it('should call external processor', function() {
            var render = processor.css('less', stubs.module);
            var result = '/foo.brk-mod';
            return render().should.eventually.equal(result);
        });
    });
});
