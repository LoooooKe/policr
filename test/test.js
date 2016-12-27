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
    describe('Handle delete cases', function() {
      before(function() {
        this.data = fs.readFileSync( `${__dirname}/data/no-hash-node.txt`, 'utf8' );
        this.plan = new Plan();
        this.result = this.plan.parse( this.data );
      });
      it('should have add, rep, mod, del properties', function() {
        expect(this.result).to.have.all.keys('add', 'rep', 'mod', 'del');
      });
      it('should have a del key of type object', function() {
        expect( this.result.del ).to.be.an('object');
      });
      it('should have a del key with keys aws_autoscaling_group and aws_launch_configuration', function() {
        expect( this.result.del ).to.have.all.keys( [ 'aws_autoscaling_group', 'aws_launch_configuration' ] );
      });
      it('should have a aws_autoscaling_group.XYZ_Application_AutoscaleGroup key', function() {
        expect( this.result.del.aws_autoscaling_group ).to.have.all.keys( [ 'XYZ_Application_AutoscaleGroup' ] );
      });
      it('should have a aws_launch_configuration.XYZ_Application_LaunchConfiguration key', function() {
        expect( this.result.del.aws_launch_configuration ).to.have.all.keys( [ 'XYZ_Application_LaunchConfiguration' ] );
      });
    });
    before(function() {
      this.data = fs.readFileSync( `${__dirname}/data/plan.txt`, 'utf8' );
      this.plan = new Plan();
      this.result = this.plan.parse( this.data );
      // console.log( JSON.stringify( this.result.add, null, 2 ) );
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
    describe('aws_instance type', function() {
      it('should have an add aws_instance property', function() {
        expect(this.result.add).to.contain.all.keys( 'aws_instance' );
      });
      it('should have an add aws_instance.XYZ_XMDXYZA5006 property', function() {
        expect(this.result.add.aws_instance).to.contain.all.keys( 'XYZ_XMDXYZA5006' );
      });
      it('aws_instance instance should have an add encrypted property', function() {
        expect(this.result.add.aws_instance.XYZ_XMDXYZA5006).to.contain.all.keys( 'private_ip' );
      });
      it('aws_instance encrypted property should be a boolean', function() {
        expect(this.result.add.aws_instance.XYZ_XMDXYZA5006.private_ip).to.equal( '10.237.2.144' );
      });
    });
  });
});

