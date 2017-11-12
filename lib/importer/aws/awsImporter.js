var fs = require('fs');
var AWS = require('aws-sdk');
var Q = require('q');

AWS.config.region = 'eu-central-1';
if (fs.existsSync('./lib/aws/.proxy.js')) {
    /* Example proxy conf:
     * var proxy = require('proxy-agent');
     * module.exports = function (AWS) {
     *  AWS.config.update({
     *      httpOptions: {
     *          agent: proxy('http://USER:PASS@proxy.test.com:PORT')
     *      }
     *  });
     * };
     */
    require('./.proxy.js')(AWS);
}


function AWSRunner(options, args) {
    this.options = options;
    this.args = args;
};

AWSRunner.prototype.translate = function(type) {
    switch(type) {
        case 'aws_s3_bucket':
            return [AWSRunner.prototype.importS3BucketDetails, this.getS3()];
        case 'aws_iam_user':
            return [AWSRunner.prototype.importIamUserDetails, this.getIAM()];
    }
};

AWSRunner.prototype.importAll = function() {
    return Q.all([
        ...this.importS3(),
        ...this.importIam()
    ]);
};

AWSRunner.prototype.importAllDetails = function(resourceMap) {
    var deferred = Q.defer();
    var result = {};
    var self = this;
    Q.all(Object.keys(resourceMap).map(function(key) { // get details
        var method = self.translate(resourceMap[key])[0];
        var service = self.translate(resourceMap[key])[1];
        var type = resourceMap[key];
        return method(service, key, type);
    })).then(function(data) {
        for(var i in data) {
            Object.keys(data[i]).map(function (key) {
                if (!result[key])
                    result[key] = [];
                result[key].push(data[i][key]);
            });
        }
        deferred.resolve(result);
    }).fail(function(err){
        deferred.reject(new Error(err));
    });
    return deferred.promise;
};

AWSRunner.prototype.importS3 = function () {
    return Object.assign(
        this.import(this.getS3(), 'listBuckets', 'Buckets', 'aws_s3_bucket', 'Name')
    );
};

AWSRunner.prototype.importIam = function () {
    return Object.assign(
        this.import(this.getIAM(), 'listUsers', 'Users', 'aws_iam_user', 'UserName'),
        this.import(this.getIAM(), 'listRoles', 'Roles', 'aws_iam_role', 'RoleName')
        // this.import(new AWS.IAM(), 'listPolicies', 'Policies', 'aws_iam_polixy', 'PolicyName');
    );
};

AWSRunner.prototype.importIamUserDetails = function (service, username, type) {
    var details = Q.all([
        Q.ninvoke(service, 'getUser', {UserName:username}).then(function(data) {return data.User})
    ]);
    return AWSRunner.prototype.importDetails(details, username, type);
};

AWSRunner.prototype.importS3BucketDetails = function (service, bucket, type) {
    var details = Q.all([
        Q.ninvoke(service, 'getBucketLocation', {Bucket:bucket}).then(function(data) {return {Region: data.LocationConstraint}}).fail(function(err){return {}}),
        Q.ninvoke(service, 'getBucketVersioning', {Bucket:bucket}).then(function(data) {return {Versioning: data.Status}}).fail(function(err){return {}}),
        Q.ninvoke(service, 'getBucketAcl', {Bucket:bucket}).then(function(data) {return {Acl: data}}).fail(function(err){return {}}),
        Q.ninvoke(service, 'getBucketWebsite', {Bucket:bucket}).then(function(data) {return {Website: data}}).fail(function(err){return {}}),
        Q.ninvoke(service, 'getBucketCors', {Bucket:bucket}).then(function(data) {return {Cors: data.CORSRules}}).fail(function(err){return {}}),
        Q.ninvoke(service, 'getBucketLogging', {Bucket:bucket}).then(function(data) {return data.LoggingEnabled ? {Logging: data.LoggingEnabled} : {}}).fail(function(err){return {}}),
        Q.ninvoke(service, 'getBucketLifecycle', {Bucket:bucket}).then(function(data) {return {Lifecycle: data.Rules}}).fail(function(err){return {}}),
        Q.ninvoke(service, 'getBucketReplication', {Bucket:bucket}).then(function(data) {return {Replication: data.ReplicationConfiguration}}).fail(function(err){return {}}),
        Q.ninvoke(service, 'getBucketTagging', {Bucket:bucket}).then(function(data) {return {Tags: data.TagSet}}).fail(function(err){return {}})
    ]);
    return AWSRunner.prototype.importDetails(details, bucket, type);
};

AWSRunner.prototype.importDetails = function (detailsPromise, id, type) {
    var deferred = Q.defer();
    detailsPromise.then(function(results) {
        var res = {};
        res[type] = Object.assign({Name: id}, ...results);
        deferred.resolve(res);
    }).fail(function(err){
        deferred.reject(new Error(err));
    });
    return deferred.promise;
};

AWSRunner.prototype.import = function(AWSService, method, awsType, tfType, idAttribute) {
    var self = this;
    return Q.ninvoke(AWSService, method).then(function(data) {
        var rm = {};
        data[awsType].forEach(function (object) {
            rm[object[idAttribute]] = tfType;
        });
        return rm;
    }).fail(function(err) {
        console.log(err);
    });
};

AWSRunner.prototype.getS3 = function () {
    if(!this.S3)
        this.S3 = new AWS.S3();
    return this.S3;
};

AWSRunner.prototype.getIAM = function () {
    if(!this.IAM)
        this.IAM = new AWS.IAM();
    return this.IAM;
};

module.exports = AWSRunner;
