var includeHelperNames = ['in', 'include', 'import'];
var util = require('util');
var debug = require('debug')('brick-hbs');
var _ = require('lodash');
var hbs;

function isOptions(obj) {
    return _.has(obj, 'name') && _.has(obj, 'hash') && _.has(obj, 'data');
}

function includeHelper(mid, options, cb) {
    debug('include: ' + mid);
    var locals = _.defaults(this, options.data.root);
    locals.brk.render(mid, locals)
        .then(function(html) {
            cb(new hbs.SafeString(html));
        })
        .catch(function(err) {
            debug(err);
            cb(new hbs.SafeString(
                util.format('<!--Error import %s: %s-->',
                    mid, err.message)));
        });
}

module.exports = function(h) {
    hbs = h;
    includeHelperNames.forEach(function(name) {
        hbs.registerAsyncHelper(name, includeHelper);
    });
};
