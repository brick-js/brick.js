exports.url = '/';

exports.get = function(req, res){
    res.render({
        title: 'Hello World',
        users: [{
            name: 'Alice',
            gender: 0,
            birthday: new Date(1991, 4, 13)
        },{
            name: 'Bob',
            gender: 1,
            birthday: new Date(1993, 2, 20)
        }]
    });
};
