const env = require('./utils/env');
const expect = env.expect;
const Render = require('../src/render.js');
const fs = require('fs');
const Path = require('path');
const sinon = require('sinon');
const stubs = require('./utils/stubs');
const wmd = require('../src/module.js');
const render = require('../src/render');
const config = require('../config.js');
const _ = require('lodash');

describe('loader', function() {
    var cfg;
    beforeEach(function() {
        wmd.clear();
        cfg = config.factory(stubs.brickConfig);
    });
    it('config:router, config.view should be optional', function() {
        var cfg = {
            root: Path.resolve(__dirname, './cases')
        };
        wmd.loadAll(config.factory(cfg));
        expect(wmd.get('incom-plete').template).to.contain('inCom_plete/view.html');
        expect(wmd.get('simple').router.url).to.equal('/');
    });
    it('config:view should support an array', function() {
        var _cfg = {
            root: Path.resolve(__dirname, './cases'),
            router: 'router.js',
            view: ['view.html', 'index.html']
        };
        wmd.loadAll(config.factory(_cfg));
        expect(wmd.get('index-view-name').template).to.contain('index.html');
    });
    it('should load all directories as modules', function() {
        var mods = wmd.loadAll(cfg);
        var n = fs.readdirSync(stubs.root).length;
        expect(mods.length).to.equal(n);
    });
    it('should load empty module', function() {
        wmd.loadAll(cfg);
        var mod = wmd.get('fs');
        expect(mod.template).to.exist;
        expect(mod.router.url).to.not.exist;
    });
    it('should load a simple module', function() {
        wmd.loadAll(cfg);
        var mod = wmd.get('simple');
        var file = Path.resolve(stubs.brickConfig.root, 'simple/index.css');
        expect(mod).to.have.property('id');
        expect(mod).to.have.property('template');
        expect(mod).to.have.property('router');
        expect(mod.router).to.have.property('url');
        expect(mod.router).to.have.property('get');
    });
});
