describe('config', function() {
    require('./config');
});

describe('io', function() {
    require('./io/fs');
    require('./io/http');
});
    
describe('module', function() {
    require('./module/parser');
    require('./module/loader');
    require('./module/render');
    require('./module/context');
    require('./module/resolver');
    require('./module/renderer');
});

