delete require.cache[require.resolve('../../../lib/importer/tf/tfRunner')];
var chai = require('chai');
var mockSpawn = require('mock-spawn');
const mockFs = require('mock-fs');
var spawnMock = mockSpawn();
require('child_process').spawn = spawnMock;
var expect = chai.expect;

var TerraformRunner = require('../../../lib/importer/tf/tfRunner');

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
        describe("Execute terraform plan", function(){
            it('should call terraform plan', function() {
                spawnMock.setDefault(spawnMock.simple(0, 'plan'));
                return tf.plan().then(function (data) {
                    expect(data).to.be.eql('plan');
                    expect(spawnMock.calls[0].command).to.be.eql('terraform plan');
                });
            });
        });
        describe("Execute terraform state with bad file", function(){
            it('should call terraform refresh', function() {
                spawnMock.setDefault(spawnMock.simple(0, 'state'));
                return tf.state().then(function (data) {
                    expect(data).to.be.eql('state');
                }).fail(function (err) {
                    expect(spawnMock.calls[1].command).to.be.eql('terraform refresh');
                    expect(err).to.not.be.undefined;
                });
            });
        });
        describe("Execute terraform state with ", function(){
            before(function() {
                mockFs({
                    'terraform.tfstate': 'testcontent'
                });
            });
            it('should call terraform refresh', function() {
                spawnMock.setDefault(spawnMock.simple(0, 'state'));
                return tf.state().then(function (data) {
                    expect(data).to.be.eql('testcontent');
                    expect(spawnMock.calls[2].command).to.be.eql('terraform refresh');
                }).fail(function (err) {
                    expect(err).to.be.undefined;
                });
            });
            after(function() {
                mockFs.restore();
            });
        });

        describe("Execute terraform refresh", function(){
            it('should call terraform refresh', function() {
                spawnMock.setDefault(spawnMock.simple(0, 'refresh'));
                return tf.refresh().then(function (data) {
                    expect(data).to.be.undefined;
                    expect(spawnMock.calls[3].command).to.be.eql('terraform refresh');
                });
            });
        });
    });
});