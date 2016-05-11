const env = require('./utils/env');
const config = require('../config.js');

describe('config', function() {
    it('should have default value', function() {
        config.factory().root.should.be.a('string');
    });
    it('should respect init config', function() {
        config.factory({root: 'xx'}).root.should.equal('xx');
    });
    it('set should return this', function() {
        var cfg = config.factory();
        cfg.set('foo', 'bar').should.equal(cfg);
    });
    it('should get correctly after set', function() {
        config.factory().set('bar', 'foo').get('bar').should.equal('foo');
    });
});
