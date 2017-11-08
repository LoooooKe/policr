'use strict';
var fs = require('fs');
var Mocha = require('mocha');
global.chai = require('chai'); // used in test files...
global.chai.use(require('chai-string'));
var path = require('path');
var jenkinsreporter = require('mocha-jenkins-reporter'); // dummy for packaging..

function MochaChecker(externalDir) {
    var mocha = new Mocha({
        "reporter": "mocha-jenkins-reporter",
        "reporterOptions": {
            "junit_report_name": "Tests",
            "junit_report_path": "test-reports/report.xml",
            "junit_report_stack": 1
        }
    });

    if(externalDir) {
        addFiles(mocha, externalDir);
    }

    this.mocha = mocha;
}

var addFiles = function(mocha, dir) {
    fs.readdirSync(dir).filter(function(file){
        return file.substr(-3) === '.js';

    }).forEach(function(file){
        mocha.addFile(
            path.join(dir, file)
        );
    });
};

MochaChecker.prototype.run = function(done) {
    // Run the tests.
    this.mocha.run(function(failures){
        if(failures)
            console.log("There are test failures: " + failures);
    });
};

module.exports = MochaChecker;

