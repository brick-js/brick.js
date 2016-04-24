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
const processor = require('../../module/processor.js');
const fs = require('../../io/fs');
var loader = fs.readSync(Path.resolve(__dirname, '../../assets/common.js'));

describe('static', function() {
    var mods, sttc, cfg;

    before(function() {
        cfg = config.factory(stubs.brickConfig);
        render.register('hbs', stubs.hbs);
        processor.register('css', require('../../processors/css'));
        processor.register('js', require('../../processors/js'));
    });

    it('should get simple CSS', function() {
        mods = [wmd.loadModule(Path.resolve(cfg.root, 'simple'), cfg)];
        sttc = Static(mods, cfg.static);
        var result = '/* brick: simple */\n.brk-simple div {\n' +
            '  color: red;\n}\n';
        return sttc.getCss().should.eventually.equal(result);
    });

    it('should handle null CSS', function() {
        mods = [wmd.loadModule(Path.resolve(cfg.root, 'fs'), cfg)];
        sttc = Static(mods, cfg.static);
        return sttc.getCss().should.eventually.equal('');
    });

    it('should get simple JS', function() {
        mods = [wmd.loadModule(Path.resolve(cfg.root, 'simple'), cfg)];
        sttc = Static(mods, cfg.static);
        var result = loader + '\n// brick: simple\n' + 
            'window.brick.register("simple", function(require, exports, module){\n'+
                "console.log('am loaded');\n" +
            '});';
        return sttc.getJs().should.eventually.equal(result);
    });

    it('should handle null JS', function() {
        mods = [wmd.loadModule(Path.resolve(cfg.root, 'fs'), cfg)];
        sttc = Static(mods, cfg.static);
        return sttc.getJs().should.eventually.equal(loader);
    });
});

