module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        run: {
            package: {
                cmd: 'node',
                args: [
                    'node_modules/pkg/lib-es5/bin.js',
                    '--out-path=build/temp',
                    '--targets=node<%= pkg.engines.node %>-win-x64,node<%= pkg.engines.node %>-linux-x64,node<%= pkg.engines.node %>-macos-x64',
                    'lib/<%= pkg.name %>.js'
                ]
            }
        },
        compress: {
            main: {
              options: {
                archive: 'build/<%= pkg.name %>-<%= pkg.version %>.zip',
                mode: 'zip'
              },
              files: [
                { cwd:'build/temp/', expand: true, src: '<%= pkg.name %>-win.exe', dest: '/' },
                { cwd:'build/temp/', expand: true, src: '<%= pkg.name %>-linux', dest: '/' },
                { cwd:'build/temp/', expand: true, src: '<%= pkg.name %>-macos', dest: '/' }
                ]
            }
        },
        clean:['build/temp'],
        mochaTest: {
            test: {
              src: ['./test/**/*.js']
            }
          }
    });
    
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', [
        'build'
    ]);
    
    grunt.registerTask('build', [
          'run:package',
          'compress:main',
          'test',
          'clean'
    ]);

    grunt.registerTask('test', ['mochaTest']);
};