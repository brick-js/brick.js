var express = require('express');
var brickJs = require('../..');
var Liquid = require('brick-liquid');

var brk = brickJs();
brk.engine('.html', Liquid());

var app = express();
app.use('/', brk.express);
app.listen(3000, () => console.log('listening to 3000'));
