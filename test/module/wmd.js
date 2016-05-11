const env = require('../utils/env');
const should = env.should;
const Path = require('path');
const stubs = require('../utils/stubs');
const wmd = require('../../module/wmd');
const render = require('../../module/render');
const config = require('../../config.js');
const _ = require('lodash');

describe('wmd', function() {
    var cfg, mods;
    before(function(){
        cfg = config.factory(stubs.brickConfig);
        mods = wmd.loadAll(cfg);
    });
    it('should accept array of views', function() {
        var _cfg = _.cloneDeep(cfg);
        _cfg.view = ['view.html', 'index.html'];
        wmd.loadAll(_cfg);
        var mod = wmd.get('simple');
        return mod.html.should.contain('index.html');
    });
    it('should load all mods', function() {
        return mods.length.should.equal(4);
    });
    it('should load empty', function() {
        var mod = wmd.get('fs');
        return should.not.exist(mod.css || mod.html || 
            mod.client || mod.url);
    });
    it('should load simple', function() {
        var mod = wmd.get('simple');
        var file = Path.resolve(stubs.brickConfig.root, 'simple/index.css');
        return mod.should.have.property('html') && 
            mod.should.have.property('url') &&
            mod.should.have.property('render') &&
            mod.should.have.property('id');
    });
});


