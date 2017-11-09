var mockCli = require('mock-cli');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var Q = require('Q');

var argv = ['node', 'policr.js', 'tf-plan']; // Fake argv

var out, err, imp, check;
var stdio = {
    stdin: null,
    stdout: out,
    stderr: err
};
describe('Test the cli with tf-plan cmd', function() {
    before(function() {
        imp = sinon.stub(require('../lib/importer/factory'), 'create').callsFake(function(cmd, options, args ) {
            return {
                import: function() {
                    log(cmd, options, args);
                    return Q.fcall(function() {
                        return 'resourceMap';
                    });
                }};
        });
        check = sinon.stub(require('../lib/checker/factory'), 'create').callsFake(function(checker, options, args ) {
            return {
                run: function() {
                    log(checker, options, args);
                }};
        });

        function log(mode, options, args) {
            console.log('{mode:'+mode+';'+JSON.stringify(options)+';'+args+'}');
        };
    });
    it('must run and terminate with exit code 0', function(done) {
        var kill = mockCli(argv, stdio, function(error, result) {
            var exitCode = result.code; // Process exit code
            var stdout = result.stdout; // UTF-8 string contents of process.stdout
            var stderr = result.stderr; // UTF-8 string contents of process.stderr

            expect(exitCode).to.be.eql(0);
            expect(stdout).to.be.eql('{mode:tf-plan;{"file":null,"tests":null,"workdir":"."};}\n{mode:mocha;{"file":null,"tests":null,"workdir":"."};}\nSuccessful.\n');
            expect(stderr).to.be.eql('');
            done();
        });
        // Execute the CLI task
        require('../lib/policr');

        // Kill the task if still running after one second
        setTimeout(kill, 1000);
    });
    after(function() {
       imp.restore();
       check.restore();
    });
});