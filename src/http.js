var debug = require('debug')('brick:io:http');

function send(res, type, status, content) {
    if(status) 
        res.status(status);
    res
        .set('Content-Type', type)
        .end(content);
    return content;
}

module.exports = {
    send,
    ok: (res, type, content) => 
        send(res, type, false, content),
    html: (res, content, status) =>
        send(res, 'text/html', status, content),
    notFound: (res) =>
        send(res, 'text/plain', 404, 'Not Found'),
    internalError: res =>
        send(res, 'text/plain', 500, 'Internal Error')
};
