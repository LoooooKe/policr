/*
 * Cloud tool for testing and provisioning using terraform as provisioner.
 *
 * run with
 * "node cloudtool.js [options] <command> [args]"
 *
 * help
 * "node cloudtool.js -h"
 *
 * @author: feuzlu
 */
var cli = require('cli');
var TestRunner = require('./testrunner.js');
var TerraformRunner = require('./terraformrunner.js');

var operations = ['plan', 'apply', 'destroy', 'force-unlock', 'init', 'state'];

cli.parse({ tests: [ 't', 'tests', 'string', null ],
            workdir: [ 'w', 'workdir', 'string', '.' ],
            skipTests: [ 's', 'skipTests', 'true', false ]},
        operations);

cli.main(function(args, options){
    var tf = new TerraformRunner(options.workdir);
    if(cli.command == 'init') {
        tf.init();
    } else if(cli.command == 'destroy') {
        tf.destroy();
    } else if(cli.command == 'force-unlock') {
        tf.unlock(args[0]);
    } else if(cli.command == 'state') {
        tf.state(function() {
            // test
            var testRunner = new TestRunner(options.tests);
            testRunner.run();
        });
    } else if(cli.command == 'apply') {
            tf.run(function(callback) {
                if(!options.skipTests) {
                    // test
                    var testRunner = new TestRunner(options.tests);
                    testRunner.run();
                } else {
                    console.log("Skipping tests...");
                }
                callback();
            });
    } else if(cli.command == 'plan') {
        tf.plan(function() {
            // test
            var testRunner = new TestRunner(options.tests);
            testRunner.run();
        });
    } else {
        console.log("Unknown command: " + cli.command);
    }
});