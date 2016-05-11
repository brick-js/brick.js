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
        fs.subdirsSync(testDir).should.deep.equal(['subdir1', 'subdir2']);
    });
    it('should test file existSync', function() {
        fs.existSync(testDir).should.equal(true) &&
            fs.existSync(testDir + '/subdir-not-exist').should.equal(false);
    });
    it('readSync should throw when file not exist', function() {
        (function(){
            fs.readSync('there-is-no-such-file');
        }).should.throw();
    });
    it('readSync should throw when not exist', function() {
        var f = Path.resolve(__dirname, '../cases/fs/subdir1/.gitignore');
        fs.readSync(f).should.equal('node_modules\n');
    });
    it('read should reject when file not exist', function() {
        return fs.read('there-is-no-such-file').should.eventually.be.rejected;
    });
    it('read should resolve correct content', function() {
        var f = Path.resolve(__dirname, '../cases/fs/subdir1/.gitignore');
        return fs.read(f).should.eventually.equal('node_modules\n');
    });
});
