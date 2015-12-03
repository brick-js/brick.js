var path = require('path');

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env: {
            dev: {
                NODE_ENV: 'development',
                DEBUG: 'brick:*,brick-hbs:*,demo:*'
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
                    spawn: false,
                    livereload: 35728
                }
            },
            grunt:{
                files: ['Gruntfile.js'],
                tasks: ['env:dev', 'express:dev'],
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
