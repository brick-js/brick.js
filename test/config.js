const env = require('./utils/env');
const should = env.should;
const Path = require('path');
const stubs = require('./utils/stubs');
const render = require('../module/render.js');
const sinon = require('sinon');
const assert = require('assert');
const config = require('../config.js');

describe('config', function() {
    it('should have default value', function() {
        return config.factory().root.should.be.a('string');
    });
    it('should respect init config', function() {
        return config.factory({root: 'xx'}).root.should.equal('xx');
    });
    it('should support get/set', function() {
        return config.factory().set('foo', 'bar').foo.should.equal('bar');
    });
});
