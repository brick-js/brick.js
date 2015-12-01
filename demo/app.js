var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var brickJs = require('..');
var apis = require('./apis');
var hbs = require('brick-hbs');
var debug = require('debug')('demo:app');

var app = express();

app.use(favicon(path.join(__dirname, 'public/img', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var brk = brickJs({
    root: path.join(__dirname, 'modules'),
    render: app.render.bind(app),
    engine: hbs.brick({
        cache: false
    })
});

app.use('/api', apis);
app.use('/', brk.express);

module.exports = app;
