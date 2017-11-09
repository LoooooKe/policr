'use strict';
var Q = require('q');
var fs = require('fs');
const spawn = require('child_process').spawn;

function TerraformRunner(workdir) {
    this.workdir = workdir;
    this.cd = 'cd ' + workdir + ' && ';
    if(workdir == '.')
        this.cd = '';
}

TerraformRunner.prototype.state = function() {
    var workdir = this.workdir;
    var deferred = Q.defer();
    this.refresh().then(function() {
        var data = fs.readFileSync(workdir + '/terraform.tfstate', 'utf8' );
        deferred.resolve(data);
    });
    return deferred.promise;
};

TerraformRunner.prototype.refresh = function() {
    var deferred = Q.defer();
    this.execute(this.cd + 'terraform refresh', function() {
        deferred.resolve();
    });
    return deferred.promise;
};

TerraformRunner.prototype.plan = function() {
    var deferred = Q.defer();
    this.execute(this.cd + 'terraform plan', function(output, error) {
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
            callback(databuffer.join(''), errorbuffer.join(''));
    });

    // handle exit
    process.on('SIGINT', function() {
        tf.kill();
    });
    process.on('SIGTERM', function() {
        tf.kill();
    });
    process.on('exit', function () {
        tf.kill();
    });
};

module.exports = TerraformRunner;

