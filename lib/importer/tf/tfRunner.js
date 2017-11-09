'use strict';
var Q = require('q');
var fs = require('fs');
const spawn = require('child_process').spawn;

function TerraformRunner(workdir) {
    this.workdir = workdir;
    this.cd = 'cd ' + workdir + ' && ';
    if(workdir === undefined || workdir === null || workdir == '.')
        this.cd = '';
}

TerraformRunner.prototype.state = function() {
    var workdir = this.workdir;
    var deferred = Q.defer();
    this.refresh().then(function() {
        var data = fs.readFileSync(workdir + '/terraform.tfstate', 'utf8' );
        deferred.resolve(data);
    }).fail(function(error) {
        deferred.reject(new Error(error));
    });
    return deferred.promise;
};

TerraformRunner.prototype.refresh = function() {
    var deferred = Q.defer();
    this.execute(this.cd + 'terraform refresh', function(error, output) {
        if(error)
            deferred.reject(new Error(error));
        deferred.resolve();
    });
    return deferred.promise;
};

TerraformRunner.prototype.plan = function() {
    var deferred = Q.defer();
    this.execute(this.cd + 'terraform plan', function(error, output) {
        if(error)
            deferred.reject(new Error(error));
        if(output)
            deferred.resolve(output);
    });
    return deferred.promise;
};

/**
 * Spawns a child process and streams stdout and stderr. The given callback gets called
 * when the child process exits.
 * @param cmd cmd to execute
 * @param callback fn(output, error)
 */
TerraformRunner.prototype.execute = function (cmd, callback) {
    console.log('Command: ' + cmd);
    var databuffer = [];
    var errorbuffer = [];
    var tf = spawn(cmd, {
        shell: true
    });

    tf.stderr.on('data', function (data) {
        process.stderr.write(data);
        errorbuffer.push(data);
    });
    tf.stdout.on('data', function (data) {
        process.stdout.write(data);
        databuffer.push(data);
    });
    tf.on('exit', function (exitCode) {
        console.log("Child exited with code: " + exitCode);
        if(callback)
            callback(errorbuffer.join(''), databuffer.join(''));
    });

    // handle exit
    process.on('SIGINT', function() {
        if(Object.getPrototypeOf(tf) === process.prototype && tf)
            tf.kill();
    });
    process.on('SIGTERM', function() {
        if(Object.getPrototypeOf(tf) === process.prototype && tf)
            tf.kill();
    });
    process.on('exit', function () {
        if(Object.getPrototypeOf(tf) === process.prototype && tf)
            tf.kill();
    });
};

module.exports = TerraformRunner;

