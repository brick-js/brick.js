const env = require('../utils/env');
var Path = require('path');
var fs = require('../../io/fs');
var testDir = Path.resolve(__dirname, '../cases/fs');

describe('fs', function() {
    it('should get subdirs', function() {
        return fs.subdirs(testDir).should
            .eventually.deep.equal(['subdir1', 'subdir2']);
    });
    it('should get subdirsSync', function() {
        return fs.subdirsSync(testDir).should.deep.equal(['subdir1', 'subdir2']);
    });
    it('should test file existSync', function() {
        return fs.existSync(testDir).should.equal(true) &&
            fs.existSync(testDir + '/subdir-not-exist').should.equal(false);
    });
});
