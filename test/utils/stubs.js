const path = require('path');
const BPromise = require('bluebird');
const _ = require('lodash');
const http  = require('http');

exports.hbs = {
    render: function(path, ctx, pmodularize, pctrl) {
        return pctrl('simple', ctx)
            .then(html => '<stub>' + html + '</stub>');
    }
};

exports.server = function(cfg) {
    var Brick = require('../..');
    var express = require('express');
    var app = express();

    var brick = Brick(cfg);
    app.get('/', (req, res) => res.send('Hello World!'));
    app.use(brick.express);
    return app.listen(3202);
};
