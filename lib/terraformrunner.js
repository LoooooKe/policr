/*
 * Implementation of the Terraform runner.
 *
 * This runner requires to have terraform bin in path.
 */
'use strict';
var fs = require('fs');
var Parser = require('./tf-parse/plan.js');
var State = require('./tf-parse/state.js');
const spawn = require('child_process').spawn;

function TerraformRunner(workdir) {
    this.workdir = workdir;
    this.cd = 'cd ' + workdir + ' && ';
    if(workdir == '.')
        this.cd = '';
}

TerraformRunner.prototype.state = function(done) {
    var workdir = this.workdir;
    this.refresh(function() {
        var data = fs.readFileSync(workdir + '/terraform.tfstate', 'utf8' );
        global.tfplan = new State().parse(data);
        done();
    });
};

TerraformRunner.prototype.refresh = function(done) {
    executeTerraform(this.cd + 'terraform refresh', done);
};

TerraformRunner.prototype.init = function() {
    executeTerraform(this.cd + 'terraform init');
};

TerraformRunner.prototype.destroy = function() {
    executeTerraform(this.cd + 'terraform destroy -force');
};

TerraformRunner.prototype.unlock = function(id) {
    executeTerraform(this.cd + 'terraform force-unlock ' + id);
};

TerraformRunner.prototype.plan = function(done) {
    execute(this.cd + 'terraform plan', function(output, error) {
        global.tfplan = new Parser().parse(output);
        done();
    });
};

TerraformRunner.prototype.run = function(test, done) {
    var cd = this.cd;
    this.plan(function() {
        test(function() {
            executeTerraform(cd + 'terraform apply', done);
        });
    });
};

var executeTerraform = function(cmd, done) {
    execute(cmd, function (output, error) {
        if(done)
            done();
    });
};

/**
 * Spawns a child process and streams stdout and stderr. The given callback gets called
 * when the child process exits.
 * @param cmd cmd to execute
 * @param callback fn(output, error)
 */
var execute = function (cmd, callback) {
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

