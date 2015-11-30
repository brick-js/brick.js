var Handlebars = require('handlebars');
var util = require('util');
var fs = require('fs');
var debug = require('debug')('brick-hbs:hbs');
var _ = require('lodash');
var defaultOptions = {
    cache: false,
    tplExt: '.html'
};

function BrickHbs(render) {
    this.render = render;
    this.pendings = [];
}

BrickHbs.prototype.pending = function() {
    var pendingTable = {};
    return Promise.all(this.pendings).then(results => {
        results.forEach(result => pendingTable[result.key] = result.val);
        return pendingTable;
    });
};

function Brick(config) {
    this.config = config;
    this.tplExt = config.tplExt;
    this.cache = {};
}

Brick.prototype.render = function(tplPath, ctx, pctrl) {
    ctx.brkhbs = new BrickHbs(pctrl);
    return this.getTpl(tplPath).then(tpl => link(tpl, ctx));
};

// from cache or source
Brick.prototype.getTpl = function(tplPath) {
    if (this.config.cache) {
        var tpl = this.cache[tplPath];
        if (tpl) return Promise.resolve(tpl);
    }
    return readFile(tplPath)
        .then(src => Handlebars.compile(src))
        .then(tpl => this.cache[tplPath] = tpl);
};

function link(tpl, ctx) {
    var html = tpl(ctx);
    return ctx.brkhbs.pending().then(linkTable => {
        return html.replace(/hbs-pending-(\d+)/g, (expr, name) => linkTable[name]);
    });
}

Handlebars.registerHelper('include', function(mid, options) {
    debug('include: ' + mid);
    var brkhbs = options.data.root.brkhbs,
        count = brkhbs.pendings.length;
    brkhbs.pendings.push(brkhbs.render(mid, this)
        .then(html => ({
            key: count,
            val: html
        })));
    return `hbs-pending-${count}`;
});

function readFile(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf8', function(e, data) {
            return e ? reject(e) : resolve(data);
        });
    });
}

Handlebars.brick = config => new Brick(_.defaults(config || {}, defaultOptions));
module.exports = Handlebars;
