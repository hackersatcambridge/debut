module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                wrap: true
            },
            build: {
                files: {
                    'build/oliver-and-swan.min.js': ['src/js/jquery.transit.js', 'src/js/startup.js', 'src/js/animations.js', 'src/js/main.js'],
                    'build/oliver-and-swan.notransit.min.js': ['src/js/startup.js', 'src/js/animations.js', 'src/js/main.js']
                }
                
            }
        },
        stylus: {
            build: {
                files: {
                    'build/oliver-and-swan.min.css': ['src/css/main.css']
                }
            }
        },
        copy: {
            totest: {
                files: {
                    'test/css/oliver-and-swan.min.css': ['build/oliver-and-swan.min.css'],
                    'test/js/oliver-and-swan.min.js': ['build/oliver-and-swan.min.js']
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['uglify:build', 'stylus:build', 'copy:totest']);

};