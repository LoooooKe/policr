var chai = require('chai');
var expect = chai.expect;
var factory = require('../../lib/importer/factory.js');
var TerraformImporter = require('../../lib/importer/tf/tfImporter.js');
var AWSImporter = require('../../lib/importer/aws/awsImporter.js');

describe('Tests for the importer factory', function() {
    describe('ImporterFactory tests', function(){
        it('Must have the create method', function() {
          expect(factory.create).to.be.not.undefined;
          expect(factory.create).to.be.a('function');
        });
    });

    describe('Create TerraformImporter test', function() {
        var cmds =  ['tf-state', 'tf-plan'];
        cmds.forEach(function(cmd) {
            it('Should create a TerraformImporter on cmd '+cmd, function () {
                var tf = factory.create(cmd);
                expect(tf).to.be.not.undefined;
                expect(tf).to.be.an.instanceof(TerraformImporter);
                expect(tf.import).to.be.a('function');
            });
        });
    });

    describe('Create AWSImporter test', function() {
        it('Should create a AWSImporter on cmd aws', function () {
            var aws = factory.create('aws');
            expect(aws).to.be.not.undefined;
            expect(aws).to.be.an.instanceof(AWSImporter);
            expect(aws.import).to.be.a('function');
        });
    });
});