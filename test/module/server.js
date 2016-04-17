const env = require('../utils/env');
const should = env.should;
const Path = require('path');
const parser = require('../../module/parser');
const config = require('../utils/stubs').brickConfig;

var root = Path.resolve(__dirname, '../cases');
var samplePath = Path.resolve(root, 'sample-module');
var incompletePath = Path.resolve(root, 'inCom_plete');
    
describe('server', function() {
    var samplePkg = parser.package(samplePath, config);
    var incompletePkg = parser.package(incompletePath, config);
    var sampleServer = parser.server(samplePkg, samplePath);
    var incompleteServer = parser.server(incompletePkg, samplePath);

    it('should handle normal server', function() {
        return should.exist(sampleServer.url) &&
            should.exist(sampleServer.view);
    });
    it('should handle empty server', function() {
        return should.not.exist(incompletePkg.server.url) &&
            should.not.exist(incompletePkg.server.view);
    });
});


