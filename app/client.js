const fs = require('../io/fs');
const path = require('path');
const comment = '// Brick.js https://github.com/brick-js/brick.js\n\n';

function loader(){
    var p =  path.resolve(__dirname, '../assets/client.js');
    src = fs.readSync(p)
        .replace(/[\n\r]/g, '')
        .replace(/\s+/g, ' ');
    return `${comment}\n${src}\n\n`;
}

exports.loader = loader();

