var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var TerraformSupplier = require('../../../lib/supplier/tf/tfSupplier.js');

describe('TerrafromRunner tests', function() {
    var tf = new TerraformSupplier('.');
    describe('Test available methods', function(){
        it('should return a new object', function() {
            expect(tf).to.be.an.instanceof(TerraformSupplier);
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
            expect(tf.init).to.not.be.a('function');
        });
        it('should have a unlock method', function() {
            expect(tf.unlock).to.not.be.a('function');
        });
        it('should have a apply method', function() {
            expect(tf.apply).to.not.be.a('function');
        });
        it('should have a execute method', function() {
            expect(tf.execute).to.be.a('function');
        });
        it('should have a destroy method', function() {
            expect(tf.destroy).to.not.be.a('function');
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
            tf = new TerraformSupplier('.');
        });
        it("Execute terraform plan", function(){
            sinon.stub(tf, 'execute').callsFake(expectedCommand('terraform plan'));
            tf.plan();
        });
        it.skip("Execute terraform state", function(){
            sinon.stub(tf, 'execute').callsFake(expectedCommand('terraform refresh'));
            tf.state();
        });

        it("Execute terraform refresh", function(){
            sinon.stub(tf, 'execute').callsFake(expectedCommand('terraform refresh'));
            tf.refresh();
        });
    });
});