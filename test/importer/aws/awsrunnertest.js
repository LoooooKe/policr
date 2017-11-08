var sinon = require('sinon');
var chai = require('chai');
chai.use(require('chai-fs'));
var expect = chai.expect;

var AWS = require('aws-sdk-mock');

var Q = require('q');

var AWSRunner = require('../../../lib/importer/aws/awsImporter.js');

describe('Basic AWSRunner tests', function() {
    var awsr = new AWSRunner();
    describe('Create new instance', function() {
        it('should return a new object', function() {
            expect(awsr).to.be.an.instanceof(AWSRunner);
        });
    });
    describe('Import S3', function () {
       before('Mock S3', function() {
           AWS.mock('S3', 'listBuckets', function(callback) {
               callback(null, {Buckets: [{Name: 'bucket-0'},{Name: 'bucket-1'}]});
           });
           AWS.mock('S3', 'getBucketLocation', function(params, callback) {
               callback(null, {LocationConstraint: 'eu-central-1'});
           });
           AWS.mock('S3', 'getBucketVersioning', function(params, callback) {
               callback(null, {Status: 'Enabled'});
           });
           AWS.mock('S3', 'getBucketAcl', function(params, callback) {
               callback(null, {ACL: 'dummy acl'});
           });
           AWS.mock('S3', 'getBucketWebsite', function(params, callback) {
               callback(null, {});
           });
        });
        describe('Must add 2 buckets', function() {
            it('Promise should return 2 s3 buckets', function() {
                return Q.all(awsr.importS3()).then(function(data) {
                    return Q.all(awsr.importAllDetails(data)).then(function(data) {
                        expect(data).to.not.be.undefined;
                        expect(data['aws_s3_bucket']).to.not.be.undefined;
                        expect(data['aws_s3_bucket'].length).to.eql(2);
                    }).fail(function(err) {
                        expect(err).to.be.undefined;
                    });
                });
            });
        });
    });
    describe('Import IAM', function () {
        before(function() {
            AWS.mock('IAM', 'listUsers', function(callback) {
                callback(null, {Users: [{UserName: 'User-0'},{UserName: 'User-1'},{UserName: 'User-2'}]});
            });
            AWS.mock('IAM', 'listPolicies', function(callback) {
                callback(null, {Policies: [{PolicyName: 'Policy-0'},{PolicyName: 'Policy-1'},{PolicyName: 'Policy-2'}]});
            });
        });
        describe('Must add 3 users and 3 policies to main.tf', function() {
            it('should work', function() {
                return Q.all(awsr.importIam()).then(function(data) {
                        expect(data).to.not.be.undefined;
                        expect(Object.keys(data).length).to.be.eql(1);
                    }).fail(function(err) {
                        expect(err).to.be.undefined;
                });
            });
        });
    });
    describe('Import S3 details test', function() {
        var aws = require('aws-sdk');
        var S3 = new aws.S3();
        it('must return a bucket including details', function() {
            return awsr.importS3BucketDetails(S3, 'tf-state-test-4234353453', 'aws_s3_bucket')
                .then(function(result) {
                    expect(result).to.not.be.undefined;
                    expect(Object.keys(result).length).to.be.eql(1);
                    expect(result['aws_s3_bucket'].region).to.be.eql('eu-central-1');
                }).fail(function(err) {
                    expect(err).to.be.undefined;
                });
        });
    });
    describe('Import all details test', function() {
        var resourceMap = {};
        resourceMap['tf-state-test-4234353453'] = 'aws_s3_bucket';
        resourceMap['test-uc1-4234353453'] = 'aws_s3_bucket';
        resourceMap['ds-1'] = 'aws_iam_user';
        it('should work', function() {
            return awsr.importAllDetails(resourceMap)
                .then(function(result) {
                    expect(result).to.not.be.undefined;
                    console.log(result);
                }).fail(function(err){
                    expect(err).to.be.undefined;
                });
        });
    });
});
