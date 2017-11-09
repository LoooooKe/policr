const chai = global.chai;
const expect = chai.expect;

var respurceMap = global.respurceMap;

describe('aws_iam_user tests', function() {
    var users = respurceMap.all['aws_iam_user'];
    if(users) {
        for (var key in users) {
            describe('Validate iam_user: ' + key, function() {
                var user = users[key];
                it('User must have a path set different to root', function () {
                    expect(user).to.have.property('path');
                    expect(user.path).to.not.eql('/');
                });
            });
        }
    }
});

describe('aws_s3_bucket tests', function() {
    var buckets = respurceMap.all['aws_s3_bucket'];
    if(buckets) {
        for (var key in buckets) {
            describe('Validate s3 bucket: ' + key, function() {
                var bucket = buckets[key];
                it('Must have private acl', function () {
                    expect(bucket).to.have.property('acl');
                    expect(bucket.acl).to.eql('private');
                });
                it('Must have region eu-central-1', function () {
                    expect(bucket).to.have.property('region');
                    expect(bucket.region).to.eql('eu-central-1');
                });
            });
        }
    }
});

describe('aws_s3_bucket_policy tests', function() {
   it("Every s3 bucket must have a bucket policy set", function () {
       var buckets = plan.all['aws_s3_bucket'];
       var policies = plan.all['aws_s3_bucket_policy'];
       expect(policies).to.have.all.keys(buckets);
   });
    var policies = plan.all['aws_s3_bucket_policy'];
    if(policies) {
        for (var key in policies) {
            describe('Validate s3 bucket policy: ' + key, function() {
                var policy = policies[key];
                it('Principal have to be set at least on account level', function () {
                    expect(policy).to.have.property('policy');
                    var obj = JSON.parse(policy.policy.replace(/(?:\\[rn]?)+/g, ''));
                    expect(obj).to.have.property('Statement');
                    for(var stmt in obj.Statement) {
                        expect(obj.Statement[stmt]).to.have.property('Principal');
                        expect(obj.Statement[stmt].Principal).to.have.property('AWS');
                        expect(obj.Statement[stmt].Principal.AWS).to.startsWith('arn:aws:iam::');
                    }
                });
            });
        }
    }
});