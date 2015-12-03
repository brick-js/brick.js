## Brick.JS

A fully modular MVC web application framework. Brick.js is an [Express.js][express]-based MVC, if you're not familiar with Express.js, see this:

http://expressjs.com/en/index.html

### Features

* Create reusable modules, each **module** contains: css, html, js, as well as a server controller.
* One **module** can include others, just like template partials.
* Automative CSS prefixing, JS modularization and loading.
* It's the same js/css in both development and production environment.

### Run the Demo

`demo/` directory contains a webapp powered by brick.js.
Clone this repo, install dependencies, and run grunt from `demo/` directory.

```bash
git clone git@github.com:harttle/brick.js.git && npm install
cd brick.js && npm install
cd demo && npm install
grunt
```

Open `http://localhost:3000` in your browser!

### Minimal Usage

Install brick.js as well as a template engine:

```bash
npm install --save brick.js brick-hbs
```

```javascript
var brickJs = require('brick.js');
var hbs = require('brick-hbs');

var app = express();

var brk = brickJs({
    root: path.join(__dirname, 'modules'),
    engine: hbs.brick()
});

app.use('/', brk.express);
```

### Tutorial

* [How to create a simple module?][simple-module]
* [How to add CSS and client-side JS?][css-and-js]
* [How to customize the error page?][error-page]

For all usage and contribute guide, see: [brick.js wiki][wiki]

### Options

#### Full Usage

```javascript
var brk = brickJs({
    root: path.join(__dirname, 'modules'),
    engine: hbs.brick(),
    path: {
        svr: 'server.js',
        css: 'index.css',
        clt: 'client.js',
        tpl: 'index.html'
    },
    static: {
        css: {
            url: '/brick.js/site.css',
            file: path.resolve(__dirname, '.build/site.css'),
            comment: '/* brick.js module: %s */'
        },
        js: {
            url: '/brick.js/site.js',
            file: path.resolve(__dirname, '.build/site.js'),
            comment: '// brick.js module: %s'
        }
    }
});
```

#### root

Type: `String`
Default: `path.join(__dirname, 'modules')`

`root` is where the modules are located. Each module should be a folder consists of files specified by `path`.

#### engine

Type: `Object`
Default: `{render: (tpl, ctx, pctrl) => Promise.reject(new Error('ENOENGINE'))}`

Template engine for brick.js. Currently Available Template Engines:

* [brick-hbs][brick-hbs]: Handlebars template engine for brick.js.
* [brick-liquid][brick-liquid]: Comming soon...

Template Engine Development Guide: Comming soon...

#### path.svr

Type: `String`
Default: `'server.js'`

Server controller file name in module folder, see [`root`](#root).

#### path.clt

Type: `String`
Default: `'client.js'`

Client JS file name. See [`path.svr`](#pathsvr).

#### path.tpl

Type: `String`
Default: `'index.html'`

HTML template file name. See [`path.svr`](#pathsvr).

#### path.css

Type: `String`
Default: `'index.css'`

CSS/LESS file name. See [`path.svr`](#pathsvr).

#### static.css.url

Type: `String`
Default: `'/brick.js/site.css'`

A `<link href="{{static.css.url}}" rel="stylesheet">` is injected into the generated HTML automatically. And this url is registered as a router by brick.js. 

Note: there need not be a file named `site.css`.

#### static.css.file

Type: `String`
Default: `false`

Absolute filepath for brick.js to save the generated css, this file is for build/deploy usage.
When set to `false`, the css file won't be saved. 

Note: this file can be conflict with `express.static` directory. Keep the URLs different.

#### static.css.comment

Type: `String`
Default: `'/* brick.js module: %s */'`

Comment before each module's css in the generated css file (which can be access by `static.css.url`). 

Note: `%s` is the module name(aka. param-cased module folder name).

#### static.js.url

Type: `String`
Default: `'/brick.js/site.js'`

See `static.css.url`.

#### static.js.file

Type: `String`
Default: `false`

See `static.css.file`.

#### static.js.comment

Type: `String`
Default: `'// brick.js module: %s'`

See `static.css.comment`.

[express]: http://expressjs.com/en/index.html 
[simple-module]: https://github.com/harttle/brick.js/wiki/a-simple-module
[brick-hbs]: https://github.com/harttle/brick-hbs
[brick-liquid]: https://github.com/harttle/brick-liquid
[demo]: https://github.com/harttle/brick.js/tree/master/demo
[wiki]: https://github.com/harttle/brick.js/wiki
[error-page]: https://github.com/harttle/brick.js/wiki/css-and-js
[css-and-js]: https://github.com/harttle/brick.js/wiki/css-and-js
