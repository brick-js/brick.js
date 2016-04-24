// built-in css processor
const less = require('less');
const BPromise = require('bluebird');
const fs = require('../io/fs');

var processor = {
    render: (path, rootClass) => {
        function compile(src) {
            return new BPromise((resolve, reject) => {
                less.render(src, (e, output) => {
                    return e ? reject(parseError(e)) : resolve(output.css);
                });
            });

            function parseError(e){
                return {
                    message: e.message,
                    stack: JSON.stringify(e, null, 4)
                };
            }
        }
        return fs.read(path)
            .then(src => `${rootClass}{\n${src}\n}`)
            .then(compile);
    }
};

module.exports = processor;
