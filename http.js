var debug = require('debug')('brick:router');

function send(res, type, status, content) {
    res
        .set('Content-Type', type)
        .status(status)
        .end(new Buffer(content));
    return content;
}

module.exports = {
    send,
    ok: (res, type, content) => send(res, type, 200, content)
};
