exports.get = function(req, res, next){
    console.log(res.locals.title);  // Hello World
    console.log(res.locals.foo);
    res.render({
        greetings: 'Alice: ' + res.locals.foo
    });
};
