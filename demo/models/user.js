var _ = require('lodash');
var users = {}, 
    count = 0,
    defaultUser = {
        id: null,
        name: 'alice',
        description: 'Vestibulum in pede adipiscing mi dapibus condimentum. Etiam felis risus, condimentum in, malesuada eget, pretium ut, sapien.  Suspendisse placerat lectus.' 
    };

function User(obj) {
    var user = users[count] = _.defaults(obj, defaultUser);
    user.id = count++;
    user.url = '/user/' + user.id;
    user.avatar = '/img/avatar' + Math.floor(Math.random()*4) + '.jpg';
    return user;
}

exports.current = function(){
    return users[0];
};

exports.create = function(obj){
    return new User(obj);
};

exports.delete = function(id){
    users[id] = undefined;
};

exports.get = function(id) {
    return users[id];
};

exports.query = function(query) {
    return _.toArray(users);
};

exports.update = function(id, user) {
    return _.merge(users[id], user);
};

exports.create({name: 'Alice'});
exports.create({name: 'Bob'});
exports.create({name: 'Charlie'});
exports.create({name: 'Dave'});
exports.create({name: 'Eve'});
exports.create({name: 'Frank'});
