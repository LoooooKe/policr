'use strict';
var Q = require('q');
var fs = require('fs');
var Mocha = require('mocha');
global.chai = require('chai'); // used in test files...
global.chai.use(require('chai-string'));
var path = require('path');
var jenkinsreporter = require('mocha-jenkins-reporter'); // dummy for packaging..

function MochaChecker(options, args) {
    var mocha = new Mocha({
        "reporter": "mocha-jenkins-reporter",
        "reporterOptions": {
            "junit_report_name": "Tests",
            "junit_report_path": "test-reports/report.xml",
            "junit_report_stack": 1
        }
    });

    if(options.tests) {
        addFiles(mocha, options.tests);
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

MochaChecker.prototype.run = function(resourceMap) {
    global.resourceMap = resourceMap;
    var deferred = Q.defer();
    this.mocha.run(function(failures){
        if(failures)
            deferred.reject(new Error(failures));
        else {
            deferred.resolve();
        }
    });
    return deferred.promise;
};

module.exports = MochaChecker;

