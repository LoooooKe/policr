'use strict';
const _ = require('lodash');
var traverse = require('traverse');

function Parser() {
  this.result = {
    resource  : {},
    data      : {},
    module    : {}
  };
}

Parser.prototype.processResource = function( match ) {
  if( ! this.result.resource[ match[ 1 ] ] ) {
    this.result.resource[ match[ 1 ] ] = {};
  }
  let newObject = {};
  this.result.resource[ match[ 1 ] ][ match[ 2 ] ] = newObject;
  return newObject;
};

Parser.prototype.processData = function( match ) {
  let newObject = {};
  _.set( this.result.data, match[ 1 ], newObject );
  return newObject;
};


Parser.prototype.processModule = function( match ) {
  let newObject = {};
  _.set( this.result.module, match[ 1 ], newObject );
  return newObject;
};

Parser.prototype.processProperty = function( current, line ) {
  const objectMatch = line.match( /^\ \ (.+)\% \= (.+)$/ );
  const match = line.match( /^\ \ ([^\ ].+) \=\s?(.*)$/ );
  if( objectMatch ) {
    // Discard
  } else if( match ) {
    this.currentProperty = _.trim( match[ 1 ] );
    _.set( current, this.currentProperty, match[ 2 ] );
  } else {
    let currentVal = _.get( current, this.currentProperty );
    _.set( current, this.currentProperty, currentVal + '\n' + line );
  }
};

function postProcessArray( node ) {
  if( node[ '#' ] ) {
    const keys = _.sortBy( _.map( _.without( _.keys( node ), '#' ), key => parseInt( key, 10 ) ) );
    const list = [];
    for( let key of keys ) {
      list.push( node[ key ] );
    }
    this.update( list );
  }
}

Parser.prototype.parse = function( input ) {
  let lines = input.split('\n');
  let resourceMatch   = null;
  let dataMatch       = null;
  let moduleMatch     = null;
  let currentObject   = null;

  for( let line of lines ) {
    resourceMatch  = line.match( /^(\w+)\.([\w\-\_]+):$/ );
    dataMatch      = line.match( /^data\.(.+):$/ );
    moduleMatch    = line.match( /^module\.(.+):$/ );
    
    if( resourceMatch || dataMatch || moduleMatch ) {
      if( currentObject ) {
        traverse( currentObject ).forEach( postProcessArray );
      }
      if( resourceMatch ) {
        currentObject = this.processResource( resourceMatch );
      } else if( dataMatch ) {
        currentObject = this.processData( dataMatch );
      } else if( moduleMatch ) {
        currentObject = this.processModule( moduleMatch );
      }
    } else {
      this.processProperty( currentObject, line );
    }
  }
  if( currentObject ) {
    traverse( currentObject ).forEach( postProcessArray );
  }
  
  return this.result;
};

module.exports = Parser;