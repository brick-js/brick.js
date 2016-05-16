describe('config', function() {
    require('./config');
});

describe('io', function() {
    require('./io/fs');
    require('./io/http');
});
    
describe('module', function() {
    require('./module/parser');
    require('./module/wmd');
    require('./module/wmd-context');
    require('./module/wmd-resolver');
    require('./module/render');
});

