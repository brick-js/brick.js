var express = require('express');
var brickJs = require('../..');
var Liquid = require('brick-liquid');
var path = require('path');
var morgan = require('morgan');

var brk = brickJs();
var liquid = new Liquid();

liquid.registerFilters({
    gender: function(g){
        return g ? 'Male' : 'Female';
    } 
});

brk.engine('.html', liquid);

var app = express();
app.use(morgan('dev'));
app.use('/', brk.express);
app.listen(3000, () => console.log('listening to 3000'));
