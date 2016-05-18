const env = require('../utils/env');
const Render = require('../../module/render.js');
const should = env.should;
const fs = require('fs');
const Path = require('path');
const sinon = require('sinon');
const stubs = require('../utils/stubs');
const wmd = require('../../module/wmd');
const render = require('../../module/render');
const config = require('../../config.js');
const _ = require('lodash');

describe('loader', function() {
    var cfg;
    beforeEach(function() {
        wmd.clear();
        cfg = config.factory(stubs.brickConfig);
    });
    it('config:router, config.view should be optional', function() {
        var cfg = {
            root: Path.resolve(__dirname, '../cases')
        };
        wmd.loadAll(config.factory(cfg));
        wmd.get('incom-plete').template.should.contain('inCom_plete/view.html');
        wmd.get('simple').router.url.should.equal('/');
    });
    it('config:view should support an array', function() {
        var _cfg = {
            root: Path.resolve(__dirname, '../cases'),
            router: 'router.js',
            view: ['view.html', 'index.html']
        };
        wmd.loadAll(config.factory(_cfg));
        wmd.get('index-view-name').template.should.contain('index.html');
    });
    it('should load all directories as modules', function() {
        var mods = wmd.loadAll(cfg);
        var n = fs.readdirSync(stubs.root).length;
        return mods.length.should.equal(n);
    });
    it('should load empty module', function() {
        wmd.loadAll(cfg);
        var mod = wmd.get('fs');
        should.exist(mod.template);
        should.not.exist(mod.router.url);
    });
    it('should load a simple module', function() {
        wmd.loadAll(cfg);
        var mod = wmd.get('simple');
        var file = Path.resolve(stubs.brickConfig.root, 'simple/index.css');
        mod.should.have.property('id');
        mod.should.have.property('template');
        mod.should.have.property('router');
        mod.router.should.have.property('url');
        mod.router.should.have.property('get');
    });
});
