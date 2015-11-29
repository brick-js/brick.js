var includeHelperNames = ['in', 'include', 'import'];
var util = require('util');
var debug = require('debug')('brick-hbs');
var _ = require('lodash');
var hbs;

// monkey typing...
function isOptions(obj) {
    return _.has(obj, 'name') && _.has(obj, 'hash') && _.has(obj, 'data');
}

function includeHelper(mid, options, cb) {
    debug('include: ' + mid);
    var locals = _.defaults(this, options.data.root);
    locals.render(mid, locals)
        .then(html => cb(new hbs.SafeString(html)))
        .catch(err => {
            debug(err);
            var elError = util.format('<!--Error import %s: %s-->',
                    mid, err.message);
            cb(new hbs.SafeString(elError));
        });
}

module.exports = function(h) {
    hbs = h;
    includeHelperNames.forEach(name =>
        hbs.registerAsyncHelper(name, includeHelper)
    );
};
