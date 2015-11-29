var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var brickJs = require('..');
var apis = require('./apis');
var hbs = require('express-hbs');
require('../brick-hbs.js')(hbs);
var debug = require('debug')('demo:app');

var app = express();

app.engine('html', hbs.express4({
    partialsDir: __dirname + '/modules',
    layoutsDir: __dirname + '/modules'
}));
app.set('view engine', 'html');
app.set('views', __dirname + '/modules');

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
    render: app.render.bind(app)
});
app.use('/', brk.express);
app.use('/api', apis);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        debug(err.stack);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
