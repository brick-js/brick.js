var express = require('express');
var brickJs = require('brick.js');
var Liquid = require('brick-liquid');

var brk = brickJs();
brk.engine('.html', new Liquid());

var app = express();
app.use('/', brk.express);
app.listen(3000, () => console.log('listening to 3000'));
