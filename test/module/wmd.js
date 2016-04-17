const env = require('../utils/env');
const should = env.should;
const Path = require('path');
const stubs = require('../utils/stubs');
const wmd = require('../../module/wmd');
const render = require('../../module/render');
const processor = require('../../module/processor');
const config = require('../../config.js');

describe('wmd', function() {
    var cfg;
    before(function(){
        cfg = config.factory(stubs.brickConfig);
    });
    describe('loadAll', function(){
        it('should load all mods', function() {
            var mods = wmd.loadAll(cfg);
            return mods.length.should.equal(4);
        });
    });
    describe('get', function(){
        before(function(){
            wmd.loadAll(cfg);
        });
        it('should load empty', function() {
            var mod = wmd.get('fs');
            return should.not.exist(mod.css || mod.html || 
                mod.client || mod.url);
        });
        it('should load simple', function() {
            var mod = wmd.get('simple');
            var file = Path.resolve(stubs.brickConfig.root, 'simple/index.css');
            return mod.css.path.should.equal(file);
        });
    });
});


