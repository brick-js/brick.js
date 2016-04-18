const env = require('../utils/env');
const should = env.should;
const Path = require('path');
const stubs = require('../utils/stubs');
const render = require('../../module/render.js');
const sinon = require('sinon');
const assert = require('assert');
const config = require('../../config.js');
const wmd = require('../../module/wmd');
const Static = require('../../app/static');

describe('static', function() {
    var mods, sttc, cfg;

    before(function() {
        cfg = config.factory(stubs.brickConfig);
        render.register('hbs', stubs.hbs);
    });

    it('should get simple CSS', function() {
        mods = [wmd.loadModule(Path.resolve(cfg.root, 'simple'), cfg)];
        sttc = Static(mods, cfg.static);
        var result = '/* module: simple */\n.brk-simple div {\n' +
            '  color: red;\n}\n\n';
        return sttc.getCss().should.eventually.equal(result);
    });

    it('should handle null CSS', function() {
        mods = [wmd.loadModule(Path.resolve(cfg.root, 'fs'), cfg)];
        sttc = Static(mods, cfg.static);
        var result = '/* module: fs */\n\n';
        return sttc.getCss().should.eventually.equal(result);
    });

    it('should get simple JS', function() {
        mods = [wmd.loadModule(Path.resolve(cfg.root, 'simple'), cfg)];
        sttc = Static(mods, cfg.static);
        var result = "// module: simple\nwindow.brk.simple=function(brk){\n"+
            "console.log('am loaded');\n};";
        return sttc.getJs().then(js => {
            return js.split('\n').slice(5).join('\n').trim();
        }).should.eventually.equal(result);
    });

    it('should handle null JS', function() {
        mods = [wmd.loadModule(Path.resolve(cfg.root, 'fs'), cfg)];
        sttc = Static(mods, cfg.static);
        var result = "// module: fs\nwindow.brk.fs=function(brk){\n};";
        return sttc.getJs().then(js => {
            return js.split('\n').slice(5).join('\n').trim();
        }).should.eventually.equal(result);
    });
});

