/*
 * Implementation of the Terraform runner.
 *
 * This runner requires to have terraform bin in path.
 */
'use strict';
var fs = require('fs');
var Parser = require('./tf-parse/plan.js');
var State = require('./tf-parse/state.js');
const execSync = require('child_process').execSync;
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
        if(done)
            done();
    });
};

TerraformRunner.prototype.refresh = function(done) {
    this.execute(this.cd + 'terraform refresh', done);
};

TerraformRunner.prototype.init = function() {
    this.execute(this.cd + 'terraform init');
};

TerraformRunner.prototype.destroy = function() {
    this.execute(this.cd + 'terraform destroy -force');
};

TerraformRunner.prototype.unlock = function(id) {
    this.execute(this.cd + 'terraform force-unlock ' + id);
};

TerraformRunner.prototype.import = function(type, id, done) {
    execSync(this.cd + 'terraform import ' + type + '.' + id + ' ' + id);
    if(done)
        done();
    // this.execute(this.cd + 'terraform import ' + type + '.' + id + ' ' + id, done);
};

TerraformRunner.prototype.plan = function(done) {
    this.execute(this.cd + 'terraform plan', function(output, error) {
        if(output)
            global.tfplan = new Parser().parse(output);
        if(done)
            done();
    });
};

TerraformRunner.prototype.apply = function(test, done) {
    var cd = this.cd;
    var self = this;
    this.plan(function() {
        test(function() {
            self.execute(cd + 'terraform apply', done);
        });
    });
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

