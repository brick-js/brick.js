const env = require('./utils/env');
const expect = env.expect;
const config = require('../config.js');

describe('config', function() {
    it('should have default value', function() {
        expect(config.factory().root).to.be.a('string');
    });
    it('should respect init config', function() {
        expect(config.factory({root: 'xx'}).root).to.equal('xx');
    });
    it('set should return this', function() {
        var cfg = config.factory();
        expect(cfg.set('foo', 'bar')).to.equal(cfg);
    });
    it('should get correctly after set', function() {
        expect(config.factory().set('bar', 'foo').get('bar')).to.equal('foo');
    });
});
