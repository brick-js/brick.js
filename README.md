# Brick.JS

[![NPM version](https://img.shields.io/npm/v/brick.js.svg?style=flat)](https://www.npmjs.org/package/brick.js)
[![Build Status](https://travis-ci.org/brick-js/brick.js.svg?branch=master)](https://travis-ci.org/brick-js/brick.js)
[![Coverage Status](https://coveralls.io/repos/github/brick-js/brick.js/badge.svg?branch=master)](https://coveralls.io/github/brick-js/brick.js?branch=master)
[![Dependency manager](https://david-dm.org/brick-js/brick.js.png)](https://david-dm.org/brick-js/brick.js)

A HMVC style web-dev framework for Node.js, 
The entire Web App is break down into independent modules.

A *module* is consisted of 

* styles,
* templates,
* scripts,
* and a server-side controller.

## The Demo

[brick-js/brick-demo][demo] is a minimal demo project for brick.js. 

To get started:

```bash
git clone git@github.com:brick-js/brick-demo.git --depth=1
cd brick-demo && npm install
node app.js
```

Open <http://localhost:3000> !

## Minimal Usage

Install brick.js and brick-liquid(Liquid Template Engine, see below):

```bash
npm install --save brick.js brick-liquid
```

```javascript
var express = require('express');
var path = require('path');
var brickJs = require('brick.js');
var Liquid = require('brick-liquid');

var brk = brickJs({
    root: path.join(__dirname, 'modules')
});

brk.engine('liquid', new Liquid());

var app = express();
app.use('/', brk.express);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```

## Tutorial

* [How to create a simple module?][simple-module]
* [How to add CSS and client-side JS?][css-and-js]
* [How to customize the error page?][error-page]

For usage and contribution guide, see: [brick.js wiki][wiki]

## Options

### Full Usage

```javascript
var express = require('express');
var path = require('path');
var brickJs = require('brick.js');
var Liquid = require('brick-liquid');
var less = require('brick-less');

var brk = brickJs({
    root: path.join(__dirname, 'modules'),
    html: {
        entry: 'index.html',
        engine: 'liquid'
    },
    server: {
        entry: 'server.js'
    },
    css: {
        entry: 'index.less',
        processor: 'less'
    }
    client:{
        entry: 'client.js'
    },
    static: {
        css: {
            url: 'my-custom-url.css',
            file: path.resolve(__dirname, '.build/site.css'),
            comment: '/* module: %s */',
        },
        js: {
            url: 'my-custom-url.js',
            file: path.resolve(__dirname, '.build/site.js'),
            comment: '// module: %s'
        }
    }
});

brk.engine('liquid', new Liquid());
brk.processor('less', less({root: path.join(__dirname, 'modules')}));
```

### root

Type: `String`

Default: `path.join(__dirname, 'modules')`

`root` is where the modules are located. Each module should be a folder consists of files specified by `path`.

### html.entry, css.entry, client.entry, server.entry

Type: `String`

Default: `'index.html'`, `'index.css'`, `'client.js'`, `'server.js'`

Default file name for HTML/CSS/Client-Side-JavaScript/Server-Side-Javascript in the module folder, see [`root`](#root).

### html.engine

Type: `Object`

Template engine for brick.js. Available Template Engines:

* [brick-hbs][brick-hbs]: Handlebars template engine for brick.js
* [brick-liquid][brick-liquid]: Liquid template engine for brick.js

Template Engine Development Guide: [Template Engine Interface][tpl-contrib]

### css.processor

CSS Pre-Processor for style files. Available pre-processors:

* [brick-js/brick-less][brick-less]: LESS pre-processor for brick.js.

#### static.css.url, static.js.url

Type: `String`

Default: `'/104097114116116108101.css'`, `'/104097114116116108101.js'`

Set this for deployment purpose. Ex: `'http://cdn.anyway.com/xxxxx.css'`

#### static.css.file, static.js.file

Type: `String`

Default: `false`

Set this for building purpose. Ex: `'/Users/harttle/hello-world/.build/xxxxx.css'`
When set to `false`, the css/js file won't be saved. 

[express]: http://expressjs.com/en/index.html 
[simple-module]: https://github.com/brick-js/brick.js/wiki/a-simple-module
[brick-hbs]: https://github.com/brick-js/brick-hbs
[brick-liquid]: https://github.com/brick-js/brick-liquid
[demo]: https://github.com/brick-js/brick-demo
[wiki]: https://github.com/brick-js/brick.js/wiki
[error-page]: https://github.com/brick-js/brick.js/wiki/customize-error-page
[css-and-js]: https://github.com/brick-js/brick.js/wiki/css-and-js
[param-case]: https://github.com/blakeembrey/param-case
[tpl-contrib]: https://github.com/brick-js/brick.js/wiki/Template-Engine-Interface
[brick-less]: https://github.com/brick-js/brick-less
