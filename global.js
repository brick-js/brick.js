var _ = require('lodash');

Promise.prototype.map = function(resolver){
    return this.then(arr => Promise.all(_.map(arr, resolver)));
};

