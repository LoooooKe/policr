var chai = require('chai');
var expect = chai.expect;
var factory = require('../../lib/checker/factory.js');
var MochaChecker = require('../../lib/checker/mocha/mochaChecker.js');

describe('Tests for the checker factory', function() {
    describe('CheckerFactory tests', function(){
        it('Must have the create method', function() {
          expect(factory.create).to.be.not.undefined;
          expect(factory.create).to.be.a('function');
        });
    });

    describe('Create MochaChecker test', function() {
        it('Should create a MochaChecker on type mocha ', function () {
            var chk = factory.create('mocha');
            expect(chk).to.be.not.undefined;
            expect(chk).to.be.an.instanceof(MochaChecker);
            expect(chk.run).to.be.a('function');
        });
    });
});