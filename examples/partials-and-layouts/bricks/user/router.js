exports.get = function(req, done, fail){
    console.log(this.title);  // Hello World
    console.log(this.foo);
    done({
        greetings: 'Alice: ' + this.foo
    });
};
