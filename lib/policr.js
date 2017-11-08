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
var supplierFactory = require('./supplier/factory.js');
var checkerFactory = require('./checker/factory.js');

var operations = ['plan', 'apply', 'destroy', 'force-unlock', 'init', 'state'];

cli.parse({ tests: [ 't', 'tests', 'string', null ],
            workdir: [ 'w', 'workdir', 'string', '.' ],
            skipTests: [ 's', 'skipTests', 'true', false ]},
        operations);

cli.main(function(args, options){
    var tf = supplierFactory.create('tf', options.workdir);
    if(cli.command == 'init') {
        tf.init();
    } else if(cli.command == 'destroy') {
        tf.destroy();
    } else if(cli.command == 'force-unlock') {
        tf.unlock(args[0]);
    } else if(cli.command == 'state') {
        tf.state(function() {
            var checker = checkerFactory.create('mocha', options.tests);
            checker.run();
        });
    } else if(cli.command == 'apply') {
            tf.apply(function(callback) {
                if(!options.skipTests) {
                    var checker = checkerFactory.create('mocha', options.tests);
                    checker.run();
                } else {
                    console.log("Skipping tests...");
                }
                callback();
            });
    } else if(cli.command == 'plan') {
        tf.plan(function() {
            var checker = checkerFactory.create('mocha', options.tests);
            checker.run();
        });
    } else {
        console.log("Unknown command: " + cli.command);
    }
});