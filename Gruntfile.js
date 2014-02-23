module.exports = function(grunt) {

  // Project configuration.
    
    var jsFiles = ['src/js/jquery.transit.js', 'src/js/startup.js', 'src/js/animations.js', 'src/js/main.js'],
        jsFilesNoTransit = ['src/js/startup.js', 'src/js/animations.js', 'src/js/main.js'];
    var cssFiles = {
        'build/oliver-and-swan.min.css': ['src/css/main.styl','src/css/presenter.styl']
    };
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                wrap: true,
            },
            dev: {
                files: {
                    'build/oliver-and-swan.js': jsFiles,
                    'build/oliver-and-swan.notransit.js': jsFilesNoTransit
                },
                options: {
                    beautify: true,
                    mangle: false,
                    preserveComments: 'all'
                }
                
            },
            build: {
                files: {
                    'build/oliver-and-swan.min.js': jsFiles,
                    'build/oliver-and-swan.notransit.min.js': jsFilesNoTransit
                }
            }
        },
        stylus: {
            build: {
                files: cssFiles
            },
            dev: {
                files: cssFiles
            }
        },
        copy: {
            totest: {
                files: {
                    'test/css/oliver-and-swan.min.css': ['build/oliver-and-swan.min.css'],
                    'test/js/oliver-and-swan.js': ['build/oliver-and-swan.js']
                }
            }
        },
        watch: {
            files: ['src/**'],
            tasks: ['dev', 'build']
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('dev', ['uglify:dev', 'stylus:dev', 'copy:totest']);
    grunt.registerTask('build', ['uglify:build', 'stylus:build']);
    grunt.registerTask('default', ['dev', 'build']);

};