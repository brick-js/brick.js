var Handlebars = require('handlebars');
var util = require('util');
var fs = require('fs');
var debug = require('debug')('brick-hbs:hbs');
var _ = require('lodash');
var defaultOptions = {
    cache: false,
    tplExt: '.html'
};

function RenderInfo(id, html) {
    this.id = id;
    this.html = html;
}

function BrickHbs(render) {
    this.render = render;
    this.children = [];
    this.parent = undefined;
}

BrickHbs.prototype.pending = function() {
    var pendingTable = {};
    return Promise.all(this.children).then(results => {
        results.forEach(info => pendingTable[info.id] = info.html);
        return pendingTable;
    });
};

function Brick(config) {
    this.config = config;
    this.tplExt = config.tplExt;
    this.cache = {};
}

Brick.prototype.render = function(tplPath, ctx, pctrl) {
    ctx = ctx || {};
    ctx.brkhbs = new BrickHbs(pctrl);
    return this.getTpl(tplPath).then(tpl => link(tpl, ctx));
};

Brick.prototype.getTpl = function(tplPath) {
    if (this.config.cache) {
        var tpl = this.cache[tplPath];
        if (tpl) return Promise.resolve(tpl);
    }
    return readFile(tplPath)
        .then(src => Handlebars.compile(src))
        .then(tpl => this.cache[tplPath] = tpl);
};

Handlebars.registerHelper('include', function(mid, context, options) {
    if (arguments.length < 3) {
        options = context;
        context = null;
    }
    context = _.merge({}, this, context, options.hash);
    var brkhbs = options.data.root.brkhbs,
        id = uuid(),
        p = brkhbs.render(mid, context).then(html => ({
            id, html
        }));
    brkhbs.children.push(p);
    return `hbs-pending-${id}`;
});

Handlebars.registerHelper('extend', function(mid, context, options) {
    if (arguments.length < 3) {
        options = context;
        context = null;
    }
    context = _.merge({}, this, context, options.hash);
    var brkhbs = options.data.root.brkhbs;
    brkhbs.parent = brkhbs.render(mid, context);
    return '';
});

Handlebars.registerHelper('block', function() {
    return 'hbs-pending-block';
});

function readFile(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf8', function(e, data) {
            return e ? reject(e) : resolve(data);
        });
    });
}

function link(tpl, ctx) {
    var html = tpl(ctx),
        hbs = ctx.brkhbs;
    return hbs.pending()
        .then(lktbl =>
            html.replace(/hbs-pending-(\d+)/g, (expr, name) => lktbl[name]))
        .then(html => hbs.parent ?
            hbs.parent.then(phtml => phtml.replace('hbs-pending-block', html)) :
            html
        );
}

function uuid() {
    return Math.random().toString(10).substr(2);
}

Handlebars.brick = config => new Brick(_.defaults(config || {}, defaultOptions));
module.exports = Handlebars;

