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
    describe('Import S3 tests', function () {
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
               callback(null, {Owner: 'dummyOwner', Grants: [{Grantee: {EmailAddress: 'dummy@aws.com', Type: 'AmazonCustomerByEmail'}, Permission: 'READ'}]});
           });
           AWS.mock('S3', 'getBucketWebsite', function(params, callback) {
               callback(null, {});
           });
           AWS.mock('S3', 'getBucketCors', function(params, callback) {
               callback(null, {CORSRules: [{AllowedMethods: '*', AllowedOrigins: '*'}]});
           });
           AWS.mock('S3', 'getBucketLogging', function(params, callback) {
               callback(null, {LoggingEnabled: 'Enabled'});
           });
           AWS.mock('S3', 'getBucketLifecycle', function(params, callback) {
               callback(null, {Rules: [{ID: 'dummyRule0'}]});
           });
           AWS.mock('S3', 'getBucketReplication', function(params, callback) {
               callback(null, {ReplicationConfiguration: {Role: 'dummyReplicationRole', Rules: [{ID: 'dummyReplicationRule1'}]}});
           });
           AWS.mock('S3', 'getBucketTagging', function(params, callback) {
               callback(null, {TagSet: [{Key: 'aTag', Value: 'dummy value'}]});
           });
        });
        describe('Must add 2 buckets', function() {
            it('Promise should return 2 s3 buckets', function() {
                return Q.all(awsr.importS3()).then(function(resources) {
                    return Q.all(awsr.importAllDetails(resources)).then(function(data) {
                        expect(data).to.not.be.undefined;
                        expect(data['aws_s3_bucket']).to.not.be.undefined;
                        expect(data['aws_s3_bucket'].length).to.eql(2);
                        for(var i in data['aws_s3_bucket']) {
                            var bucket = data['aws_s3_bucket'][i];
                            expect(bucket).to.not.be.undefined;
                            expect(bucket.Acl).to.not.be.undefined;
                            expect(bucket.Acl.Owner).to.be.eql('dummyOwner');
                            expect(bucket.Acl.Grants).to.be.an('array');
                            expect(bucket.Acl.Grants.length).to.eql(1);
                            expect(bucket.Acl.Grants[0].Permission).to.be.eql('READ');
                            expect(bucket.Acl.Grants[0].Grantee).to.not.be.undefined;
                            expect(bucket.Acl.Grants[0].Grantee.EmailAddress).to.be.eql('dummy@aws.com');
                            expect(bucket.Acl.Grants[0].Grantee.Type).to.be.eql('AmazonCustomerByEmail');
                            expect(bucket.Cors).to.not.be.undefined;
                            expect(bucket.Cors).to.be.an('array');
                            expect(bucket.Cors.length).to.be.eql(1);
                            expect(bucket.Cors[0].AllowedMethods).to.be.eql('*');
                            expect(bucket.Cors[0].AllowedOrigins).to.be.eql('*');
                            expect(bucket.Lifecycle).to.be.an('array');
                            expect(bucket.Lifecycle.length).to.be.eql(1);
                            expect(bucket.Lifecycle[0].ID).to.be.eql('dummyRule0');
                            expect(bucket.Logging).to.be.eql('Enabled');
                            expect(bucket.Name).to.match(/bucket-.*/);
                            expect(bucket.Region).to.be.eql('eu-central-1');
                            expect(bucket.Replication).to.not.be.undefined;
                            expect(bucket.Replication.Role).to.be.eql('dummyReplicationRole');
                            expect(bucket.Replication.Rules).to.be.an('array');
                            expect(bucket.Replication.Rules.length).to.be.eql(1);
                            expect(bucket.Replication.Rules.length).to.be.eql(1);
                            expect(bucket.Replication.Rules[0].ID).to.be.eql('dummyReplicationRule1');
                            expect(bucket.Tags).to.be.an('array');
                            expect(bucket.Tags.length).to.be.eql(1);
                            expect(bucket.Tags[0].Key).to.be.eql('aTag');
                            expect(bucket.Tags[0].Value).to.be.eql('dummy value');
                            expect(bucket.Versioning).to.be.eql('Enabled');
                            expect(bucket.Website).to.not.be.undefined;
                        }
                    }).fail(function(err) {
                        console.log(err);
                        expect(err).to.be.undefined;
                    });
                });
            });
        });
    });
    describe.skip('Import IAM', function () {
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
    describe.skip('Import all details test', function() {
        this.timeout(3000);
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

