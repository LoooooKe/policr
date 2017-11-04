module.exports = function(grunt) {
    var pkgJson = require('./package.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        project_version: pkgJson.version,
        node_version: pkgJson.engines.node,
        run: {
            package: {
                cmd: 'node',
                args: [
                    'node_modules/pkg/lib-es5/bin.js',
                    '--out-path=build/temp',
                    '--targets=node<%= node_version %>-win-x64,node<%= node_version %>-linux-x64,node<%= node_version %>-macos-x64',
                    'lib/<%= pkg.name %>.js'
                ]
            }
        },
        compress: {
            main: {
              options: {
                archive: 'build/<%= pkg.name %>-<%= project_version %>.zip',
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
              src: ['test/**/*.js']
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
          'clean'
    ]);
};