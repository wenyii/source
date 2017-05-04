module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            common: {
                options: {
                    sourceMap: true,
                    sourceMapRootpath: '/kake'
                },
                files: [{
                    expand: true,
                    cwd: 'less/',
                    src: ['**/*.less'],
                    dest: 'css/',
                    ext: '.css'
                }]
            }
        },
        postcss: {
            options: {
                map: {
                    inline: false,
                    prev: 'css/'
                },
                processors: [
                    require('autoprefixer')({browsers: 'defaults, last 2 versions, ie >= 9'})
                ]
            },
            common: {
                src: 'css/**/*.css'
            }
        },
        cssmin: {
            common: {
                files: [
                    {
                        expand: true,
                        cwd: 'css/',
                        src: ['**/*.css'],
                        dest: 'css_min/',
                        ext: '.css',
                        extDot: 'last'
                    }
                ]
            }
        },
        uglify: {
            options: {
                mangle: true, // 混淆变量名
                banner: '/*! <%= pkg.author %> */\n/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                compress: {
                    drop_console: true
                },
                report: "min"
            },
            common: {
                files: [
                    {
                        expand: true,
                        cwd: 'js/',
                        src: ['**/*.js'],
                        dest: 'js_min/',
                        ext: '.js',
                        extDot: 'last'
                    }
                ]
            }
        },
        watch: {
            css: {
                files: ['less/**/*.less'],
                tasks: ['css-less', 'css-post', 'css-compress'],
                options: {
                    spawn: true,
                    interrupt: true
                }
            },
            js: {
                files: ['js/**/*.js'],
                tasks: ['js-compress'],
                options: {
                    spawn: true,
                    interrupt: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('css-less', ['less']);
    grunt.registerTask('css-post', ['postcss']);
    grunt.registerTask('css-compress', ['cssmin']);
    grunt.registerTask('js-compress', ['uglify']);
    grunt.registerTask('listen', ['watch']);
    grunt.registerTask('handle', ['less', 'postcss', 'cssmin', 'uglify']);
};