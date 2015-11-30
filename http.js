function send(res, type, status, content) {
    res
        .set('Content-Type', type)
        .status(status)
        .end(new Buffer(content));
}

module.exports = {
    send
};
