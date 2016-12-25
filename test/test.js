'use strict';
const fs = require('fs');
const chai = require('chai');

const expect = chai.expect;

const tfParse = require('../lib');
const Plan = tfParse.Plan;

describe('lib', function() {
  describe('Plan', function() {
    it('should return a new object', function() {
      const plan = new Plan();
      expect(plan).to.be.an.instanceof(Plan);
    });
    it('should have a parse method', function() {
      const plan = new Plan();
      expect(plan.parse).to.be.a('function');
    });
  });
  describe('Plan parsing', function() {
    before(function() {
      this.data = fs.readFileSync( `${__dirname}/data/plan.txt`, 'utf8' );
      this.plan = new Plan();
    });
    it('should parse a plan.txt to an object', function() {
      const plan = this.plan.parse( this.data );
      expect(plan).to.be.an('object');
    });
  });
  describe('Parsing results', function() {
    before(function() {
      this.data = fs.readFileSync( `${__dirname}/data/plan.txt`, 'utf8' );
      this.plan = new Plan();
      this.result = this.plan.parse( this.data );
      // console.log( JSON.stringify( this.result.add, null, 2 ) );
    });
    it('should have add, rep, mod, del properties', function() {
      expect(this.result).to.have.all.keys('add', 'rep', 'mod', 'del');
    });
    describe('aws_ebs_volume type', function() {
      it('should have an add aws_ebs_volume property', function() {
        expect(this.result.add).to.contain.all.keys( 'aws_ebs_volume' );
      });
      it('should have an add aws_ebs_volume.XYZ_XMDXYZA5006_Application_sdf property', function() {
        expect(this.result.add.aws_ebs_volume).to.contain.all.keys( 'XYZ_XMDXYZA5006_Application_sdf' );
      });
      it('aws_ebs_volume instance should have an add encrypted property', function() {
        expect(this.result.add.aws_ebs_volume.XYZ_XMDXYZA5006_Application_sdf).to.contain.all.keys( 'encrypted' );
      });
      it('aws_ebs_volume encrypted property should be a boolean', function() {
        expect(this.result.add.aws_ebs_volume.XYZ_XMDXYZA5006_Application_sdf.encrypted).to.be.a( 'boolean' );
      });
    });
  });
});

