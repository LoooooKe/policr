'use strict';
const fs = require('fs');
const chai = require('chai');
const debug = require('debug')('tfparse/test');

const expect = chai.expect;

const tfParse = require('../lib');
const Plan = tfParse.Plan;
const Apply = tfParse.Apply;
const State = tfParse.State;

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
      this.data = fs.readFileSync( `${__dirname}/data/plan/plan.txt`, 'utf8' );
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
        this.data = fs.readFileSync( `${__dirname}/data/plan/no-hash-node.txt`, 'utf8' );
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
      this.data = fs.readFileSync( `${__dirname}/data/plan/plan.txt`, 'utf8' );
      this.plan = new Plan();
      this.result = this.plan.parse( this.data );
    });
    describe('aws_ebs_volume type', function() {
      it('should have an add aws_ebs_volume property', function() {
        expect(this.result.add).to.contain.all.keys( 'aws_ebs_volume' );
      });
      it('should have an add aws_ebs_volume.XYZ_XMDXYZA1006_Application_sdf property', function() {
        expect(this.result.add.aws_ebs_volume).to.contain.all.keys( 'XYZ_XMDXYZA1006_Application_sdf' );
      });
      it('aws_ebs_volume instance should have an add encrypted property', function() {
        expect(this.result.add.aws_ebs_volume.XYZ_XMDXYZA1006_Application_sdf).to.contain.all.keys( 'encrypted' );
      });
      it('aws_ebs_volume encrypted property should be a boolean', function() {
        expect(this.result.add.aws_ebs_volume.XYZ_XMDXYZA1006_Application_sdf.encrypted).to.be.a( 'boolean' );
      });
    });
    describe('aws_instance type', function() {
      it('should have an add aws_instance property', function() {
        expect(this.result.add).to.contain.all.keys( 'aws_instance' );
      });
      it('should have an add aws_instance.XYZ_XMDXYZA1006 property', function() {
        expect(this.result.add.aws_instance).to.contain.all.keys( 'XYZ_XMDXYZA1006' );
      });
      it('aws_instance instance should have an add encrypted property', function() {
        expect(this.result.add.aws_instance.XYZ_XMDXYZA1006).to.contain.all.keys( 'private_ip' );
      });
      it('aws_instance encrypted property should be a boolean', function() {
        expect(this.result.add.aws_instance.XYZ_XMDXYZA1006.private_ip).to.equal( '10.237.2.144' );
      });
    });
  });
  describe('Apply', function() {
    it('should return a new object', function() {
      const apply = new Apply();
      expect(apply).to.be.an.instanceof(Apply);
    });
    it('should have a parse method', function() {
      const apply = new Apply();
      expect(apply.parse).to.be.a('function');
    });
    describe('Parsing results', function() {
      before( function() {
        this.data = fs.readFileSync( `${__dirname}/data/apply/db/apply.txt`, 'utf8' );
        this.apply = new Apply();
        this.result = this.apply.parse( this.data );
      });
      it('should have an add property', function() {
        expect(this.result).to.have.all.keys('add');
      });
      it('should have an add key with keys aws_db_subnet_group and aws_db_instance', function() {
        expect( this.result.add ).to.have.all.keys( [ 'aws_db_subnet_group', 'aws_db_instance' ] );
      });
      it('should have 6 aws_db_subnet_group keys', function() {
        expect( this.result.add.aws_db_subnet_group ).to.have.all.keys( [
          'xyz_pudxyzd1026_subnet_group',
          'xyz_pudxyzd1027_subnet_group',
          'xyz_pudxyzd1028_subnet_group',
          'xyz_pudxyzd1029_subnet_group',
          'xyz_pudxyzd1030_subnet_group',
          'xyz_pudxyzd1031_subnet_group'
          ] );
      });
      it('should have 6 aws_db_instance keys', function() {
        expect( this.result.add.aws_db_instance ).to.have.all.keys( [
          'xyz_pudxyzd1026',
          'xyz_pudxyzd1027',
          'xyz_pudxyzd1028',
          'xyz_pudxyzd1029',
          'xyz_pudxyzd1030',
          'xyz_pudxyzd1031'
          ] );
      });
    });
  });
  
  
  
  describe('State', function() {
    it('should return a new object', function() {
      const state = new State();
      expect(state).to.be.an.instanceof(State);
    });
    it('should have a parse method', function() {
      const state = new State();
      expect(state.parse).to.be.a('function');
    });
    it('should throw an error if a string is passed that isn\'t proper JSON', function() {
      const state = new State();
      expect( function() { state.parse('{') } ).to.throw(SyntaxError);
    });
    it('should not throw an error if a string is passed that is proper JSON', function() {
      const state = new State();
      expect( function() { state.parse('{}') } ).to.not.throw(SyntaxError);
    });
    it('should not throw an error if a Object is passed', function() {
      const state = new State();
      expect( function() { state.parse( {} ) } ).to.not.throw(SyntaxError);
    });
    it('should throw an error if an unsupported state file version is passed', function() {
      const state = new State();
      expect( function() { state.parse( { version : 4 } ) } ).to.throw(/unsupported/i);
    });

    describe('Parsing results', function() {
      before( function() {
        this.data = fs.readFileSync( `${__dirname}/data/apply/db/terraform.tfstate`, 'utf8' );
        this.state = new State();
        this.result = this.state.parse( this.data );
        debug( '%j', this.result );
      });
      it('should have a resource property', function() {
        expect(this.result).to.have.all.keys('resource');
      });
      it('should have only resources', function() {
        expect(this.result).to.have.all.keys('resource');
      });
      it('should not have any data or module resources', function() {
        expect(this.result.resource).to.not.have.any.keys('data', 'module');
      });
      it('should have aws_db_instance, aws_db_subnet_group, aws_eb_volume, aws_instance, aws_s3_bucket, aws_volume_attachment resources', function() {
        expect(this.result.resource).to.have.all.keys([
          'aws_db_instance',
          'aws_db_subnet_group',
          'aws_ebs_volume',
          'aws_instance',
          'aws_s3_bucket',
          'aws_volume_attachment'
        ]);
      });
      it('should have 6 aws_db_instance objects', function() {
        expect(Object.keys( this.result.resource.aws_db_instance ).length).to.equal( 6 );
      });
      it('should have 6 aws_db_subnet_group objects', function() {
        expect(Object.keys( this.result.resource.aws_db_subnet_group ).length).to.equal( 6 );
      });
      it('should have aws_db_subnet_group.xyz_pudxyzd1026_subnet_group object', function() {
        expect( this.result.resource.aws_db_subnet_group.xyz_pudxyzd1026_subnet_group ).to.be.an('object');
      });
      it('should have aws_db_subnet_group.xyz_pudxyzd1026_subnet_group.subnet_ids array', function() {
        expect( this.result.resource.aws_db_subnet_group.xyz_pudxyzd1026_subnet_group.subnet_ids ).to.be.an('array');
      });
      it('should have aws_db_subnet_group.xyz_pudxyzd1026_subnet_group.subnet_ids array of length 2', function() {
        expect( this.result.resource.aws_db_subnet_group.xyz_pudxyzd1026_subnet_group.subnet_ids.length ).to.equal( 2 );
      });
    });
  });

  
});

