var path = require('path');

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env: {
            dev: {
                NODE_ENV: 'development',
                DEBUG: 'brick:*,brick-hbs,brick-static,demo:*'
            }
        },
        express: {
            options: {},
            dev: {
                options: {
                    script: 'bin/www',
                    background: true
                }
            },
        },
        watch: {
            express: {
                files: ['../**/*.js'],
                tasks: ['express:dev'],
                options: {
                    spawn: false
                }
            },
            grunt:{
                files: ['Gruntfile.js'],
                tasks: ['dev'],
                options: {
                    reload: true
                }
            },
            client:{
                files: ['**/*.html', '**/client.js', '**/*.css', '*.pid'],
                options: {
                    livereload: 35728
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('dev', ['env:dev', 'express:dev', 'watch']);
    grunt.registerTask('default', 'dev');
};
