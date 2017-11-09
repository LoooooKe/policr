/*
 * Continous compliance tool for testing and provisioning using terraform as provisioner.
 *
 * run with
 * "node policr.js [options] <command> [args]"
 *
 * or
 * "policr-[win.exe|linux|macos] [options] <command> [args]"
 *
 * help
 * "node pollicr.js -h"
 *
 */
var cli = require('cli');
var importerFactory = require('./importer/factory.js');
var checkerFactory = require('./checker/factory.js');

var operations = ['tf-plan', 'tf-state', 'aws', 'cf'];

cli.parse({file: [ 'f', 'file', 'string', null ],
            tests: [ 't', 'tests', 'string', null ],
            workdir: [ 'w', 'workdir', 'string', '.' ]},
        operations);

cli.main(function(args, options){
    var checker = checkerFactory.create('mocha', options, args);
    var importer = importerFactory.create(cli.command, options, args);

    importer.import()
        .then(function(resourceMap) {
            return checker.run(resourceMap);
        }).then(function() {
            console.log('Successful.');
            process.exit();
        }).fail(function(error){
            console.log(error);
            process.exit(1);
    });
});