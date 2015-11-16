var _ = require('lodash');
var cats = {}, 
    count = 0,
    defaultCat = {
        id: null,
        name: 'catty',
        description: 'Facilisi magna. Nunc pharetra velit vitae eros. Cras id .'
    };

function Cat(obj) {
    var cat = cats[count] = _.defaults(defaultCat, obj);
    cat.id = count++;
    return cat;
}

exports.create = function(obj){
    return new Cat(obj);
};

exports.get = function(id) {
    return cats[id];
};

exports.query = function(query) {
    return _.toArray(cats);
};

exports.update = function(id, cat) {
    return _.merge(cats[id], cat);
};
