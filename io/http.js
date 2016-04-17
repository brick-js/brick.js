var debug = require('debug')('brick:io:http');

function send(res, type, status, content) {
    res
        .set('Content-Type', type)
        .status(status)
        .end(content && new Buffer(content));
    return content;
}

module.exports = {
    send,
    ok: (res, type, content) => 
        send(res, type, 200, content),
    html: (res, content, status) =>
        send(res, 'text/html', status || 200, content),
    notFound: (res) =>
        send(res, 'text/plain', 404, 'Not Found'),
    internalError: res =>
        send(res, 'text/plain', 500, 'Internal Error')
};
