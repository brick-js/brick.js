var express = require('express');
var brickJs = require('../..');
var Liquid = require('brick-liquid');
var path = require('path');

var brk = brickJs();
brk.engine('.html', Liquid());

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', brk.express);
app.listen(3000, () => console.log('listening to 3000'));
