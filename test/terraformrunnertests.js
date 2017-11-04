var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var TerraformRunner = require('../lib/terraformrunner');

describe('TerrafromRunner tests', function() {
    var tf = new TerraformRunner('.');
    describe('Test available methods', function(){
        it('should return a new object', function() {
            expect(tf).to.be.an.instanceof(TerraformRunner);
        });
        it('should have a plan method', function() {
            expect(tf.plan).to.be.a('function');
        });
        it('should have a state method', function() {
            expect(tf.state).to.be.a('function');
        });
        it('should have a refresh method', function() {
            expect(tf.refresh).to.be.a('function');
        });
        it('should have a init method', function() {
            expect(tf.init).to.be.a('function');
        });
        it('should have a unlock method', function() {
            expect(tf.unlock).to.be.a('function');
        });
        it('should have a apply method', function() {
            expect(tf.apply).to.be.a('function');
        });
        it('should have a execute method', function() {
            expect(tf.execute).to.be.a('function');
        });
        it('should have a destroy method', function() {
            expect(tf.destroy).to.be.a('function');
        });
    });
    describe('Execute terraform commands', function() {
        var expectedCommand = function(expected) {
            return function(cmd, callback) {
                expect(cmd).to.eql(expected);
                if(callback)
                    callback();
            };
        };
        var tf = null;
        beforeEach('create terraformrunner mock', function() {
            tf = new TerraformRunner('.');
        });
        it("Execute terraform plan", function(){
            sinon.stub(tf, 'execute').callsFake(expectedCommand('terraform plan'));
            tf.plan();
        });
        it.skip("Execute terraform state", function(){
            sinon.stub(tf, 'execute').callsFake(expectedCommand('terraform refresh'));
            tf.state();
        });
        it("Execute terraform destroy", function(){
            sinon.stub(tf, 'execute').callsFake(expectedCommand('terraform destroy -force'));
            tf.destroy();
        });
        it("Execute terraform init", function(){
            sinon.stub(tf, 'execute').callsFake(expectedCommand('terraform init'));
            tf.init();
        });
        it("Execute terraform refresh", function(){
            sinon.stub(tf, 'execute').callsFake(expectedCommand('terraform refresh'));
            tf.refresh();
        });
        it("Execute terraform apply", function(){
            var first = true;
            sinon.stub(tf, 'execute').callsFake(function(cmd, callback) {
                if(first) {
                    expect(cmd).to.eql('terraform plan');
                    first = false;
                } else
                    expect(cmd).to.eql('terraform apply');
                if(callback)
                    callback();
            });
            tf.apply(function(callback){
                callback();
            });
        });
        it("Execute terraform unlock", function(){
            sinon.stub(tf, 'execute').callsFake(expectedCommand('terraform force-unlock 1'));
            tf.unlock(1);
        });
    });
});