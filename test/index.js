describe('config', function() {
    require('./config');
});

describe('io', function() {
    require('./io/fs');
    require('./io/http');
});
    
describe('module', function() {
    describe('parser', function() {
        require('./module/package');
        require('./module/server');
    });
    require('./module/wmd');
    require('./module/render');
    require('./module/processor');
});

describe('app', function() {
    require('./app/static');
});
