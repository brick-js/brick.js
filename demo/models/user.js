var _ = require('lodash');
var users = {}, 
    count = 0,
    defaultUser = {
        id: null,
        name: 'alice',
        description: 'Nulla facilisi. Cras id magna. Nunc pharetra velit vitae eros.',
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

exports.create({name: 'Alice', description: 'I am the current user'});
exports.create({name: 'Harttle', description: 'I am the current user'});
exports.create({name: 'Bob', description: 'I am the current user'});
