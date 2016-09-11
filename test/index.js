const request = require('supertest');
const stubs = require('./utils/stubs.js');
const mockFs = require('mock-fs');
const mockRequire = require('mock-require');
const debug = require('debug')('test:index');

describe('index', function() {
    var server, req;
    afterEach(function(done) {
        server && server.close(done);
        mockRequire.stopAll();
        mockFs.restore();
        debug(require.resolve('..'));
    });
    describe('express.Router', function() {
        beforeEach(function() {
            mockFs({
                '/bricks/main/view.html': 'main',
                '/bricks/main/router.js': '',
                '/bricks/post/router.js': '',
                '/bricks/post/view.html': 'post'
            });
            mockRequire('/bricks/main/router.js', {
                url: "/main"
            });
            mockRequire('/bricks/post/router.js', {
                url: "/post",
                post: (req, res) => res.render()
            });
            server = stubs.server({
                root: '/bricks'
            });
            req = request(server);
        });

        it('should respond to /', function testSlash(done) {
            req.get('/').expect(200, 'Hello World!', done);
        });
        it('should respond 200 to /main GET successfully', function(done) {
            req.get('/main').expect(200, 'main', done);
        });
        it('should respond 404 to /main POST', function(done) {
            req.post('/main').expect(404, done);
        });
        it('should respond 200 to /post POST', function(done) {
            req.post('/post').expect(200, 'post', done);
        });
    });
    describe('error brick', function(){
        beforeEach(function(){
            mockFs({
                '/bricks/error/router.js': '',
                '/bricks/error/view.html': 'auth failed',
            });
            mockRequire('/bricks/error/router.js', {
                get: (req, res) => res.status(403).render()
            });
            server = stubs.server({
                root: '/bricks'
            });
            req = request(server);
        });
        it('should use error brick when Error occured', function(done) {
            req.post('/nothing').expect(403, 'auth failed', done);
        });
        it('should capture errors before brick.express', function(done) {
            req.get('/api-err').expect(403, 'auth failed', done);
        });
    });
    describe('router.js', function() {
        beforeEach(function(){
            mockFs({
                '/bricks/create/router.js': '',
                '/bricks/create/view.html': '',
                '/bricks/send/router.js': '',
                '/bricks/err/router.js': ''
            });
            mockRequire('/bricks/create/router.js', {
                url: "/create",
                post: (req, res) => res.status(201).render()
            });
            mockRequire('/bricks/send/router.js', {
                url: "/send",
                get: (req, res) => res.send('send')
            });
            mockRequire('/bricks/err/router.js', {
                url: "/err",
                get: (req, res, next) => {
                    var err = new Error('foo');
                    err.status = 400;
                    next(err);
                }
            });
            server = stubs.server({
                root: '/bricks'
            });
            req = request(server);
        });
        it('should respect res.status', function(done) {
            req.post('/create').expect(201, done);
        });
        it('should respect res.send', function(done) {
            req.get('/send').expect(200, 'send', done);
        });
        it('should respect next(err)', function(done) {
            req.get('/err').expect(400, done);
        });
    });
});
