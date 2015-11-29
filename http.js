function send(res, type, content) {
    res
        .set('Content-Type', type)
        .status(200)
        .end(new Buffer(content));
}

module.exports = {
    send
};
