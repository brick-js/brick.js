const env = require('./utils/env');
const expect = env.expect;
const Response = require('../src/response.js');
const sinon = require('sinon');

describe('response', function() {
    var response, res;
    before(function(){
        res = {
            status: sinon.spy(),
            end: sinon.spy()
        };
        response = Response.create(res);
    });
    it('should bind status', function(){
        response.status(404);
        expect(res.status).to.have.been.called;
    });
});
