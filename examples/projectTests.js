const chai = global.chai;
const expect = chai.expect;

var respurceMap = global.respurceMap;

describe('there have to be two new users', function() {
    it('should have two new user objects in the plan', function() {
        expect(Object.keys(respurceMap.all['aws_iam_user']).length).to.eql(2);
    });
    it('they should have the correct names', function () {
        expect(respurceMap.all['aws_iam_user']).to.have.all.keys('user-ds-1', 'user-ds-2');
    });
});

describe('one bucket should be created', function() {
    it('should have one new s3 objects in the plan', function() {
        expect(Object.keys(respurceMap.all['aws_s3_bucket']).length).to.eql(1);
    });
    it('should have one new s3 policy objects in the plan', function() {
        expect(Object.keys(respurceMap.all['aws_s3_bucket_policy']).length).to.eql(1);
    });
});