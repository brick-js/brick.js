const env = require('../utils/env');
const Path = require('path');
const sinon = require('sinon');
const assert = require('assert');
const res = require('../utils/stubs').expressResponse;
const http = require('../../io/http');

describe('http', function() {
    var set, status, end;
    beforeEach(function(){
        set = sinon.stub(res, 'set');
        status = sinon.stub(res, 'status');
        end = sinon.stub(res, 'end');
        set.returns(res);
        status.returns(res);
    });
    afterEach(function() {
        res.set.restore();
        res.status.restore();
        res.end.restore();
    });
    it('send', function() {
        http.send(res, 'application/json', 201, 'xxx');
        return assert(status.calledWith(201)) && 
            assert(set.calledWith('Content-Type', 'application/json')) &&
            assert(end.calledWith('xxx'));
    });
    it('ok', function() {
        http.ok(res, 'application/json', 'xxx');
        return assert(status.calledWith(200)) && 
            assert(set.calledWith('Content-Type', 'application/json')) &&
            assert(end.calledWith('xxx'));
    });
    it('notFound', function() {
        http.notFound(res);
        return assert(status.calledWith(404));
    });
    it('internalError', function() {
        http.internalError(res);
        return assert(status.calledWith(500));
    });
});

