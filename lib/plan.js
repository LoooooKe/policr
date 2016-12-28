'use strict';
const _         = require('lodash');
const traverse  = require('traverse');
const stripAnsi = require('strip-ansi');
const clone     = require('clone-deep');

function Parser() {
  this.result = {
    mod : {
      prev  : {},
      next  : {}
    },
    rep : {
      prev : {},
      next : {}
    },
    add : {},
    del : {}
  };
}

const op = {
  '-/+' : 'rep',
  '-'   : 'del',
  '+'   : 'add',
  '~'   : 'mod'
};

function postProcessArray( node ) {
  if( _.isObject( node ) && node[ '#' ] ) {
    const keys = _.sortBy( _.map( _.without( _.keys( node ), '#' ), key => parseInt( key, 10 ) ) );
    const list = [];
    for( let key of keys ) {
      list.push( node[ key ] );
    }
    this.update( list );
  }
}

function postProcessTypeConversion( node ) {
  if( node == 'true' ) {
    this.update( true );
  } else if( node == 'false' ) {
    this.update( false );
  } else if( _.isString( node ) ) {
    if( node.match( /^\d+$/ ) ) {
      this.update( parseInt( node, 10 ) );
    } else if( node.match( /^[\d\.]+$/ ) ) {
      if( ! node.match( /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/ ) ) {
        this.update( parseFloat( node ) );
      }
    }
  }
}


Parser.prototype.parse = function( input ) {
  let stripped      = stripAnsi( input );
  let lines         = stripped.split( '\n' );
  let currentOp     = null;
  let currentId     = null;
  let currentTarget = null;
  let match         = null;
  
  for( let line of lines ) {
    match = line.match( /^(\-\/\+|\~|\-|\+) (.*)$/ );
    if( match ) {
      if( currentTarget ) {
        _.set( this.result, currentOp, currentTarget );
      }
      currentOp = op[ match[ 1 ] ];
      currentId = match[ 2 ];
      if( currentOp == 'del' ) {
        _.set( this.result.del, currentId, null );
      } else {
        currentTarget = clone( this.result[ currentOp ] );
      }
    } else {
      if( currentOp == 'rep' || currentOp == 'mod' ) {
        match = line.match( /^\s+(\S+):\s+\"(.*)\" \=\> \"(.*)\".*$/ );
        if( match && ! match[ 1 ].endsWith( '%' ) ) {
          _.set( currentTarget, `prev.${currentId}.${match[ 1 ]}`, match[ 2 ] );
          _.set( currentTarget, `next.${currentId}.${match[ 1 ]}`, match[ 3 ] );
        }
      } else if( currentOp == 'add' ) {
        match = line.match( /^\s+(\S+):\s+\"(.*)\"$/ );
        if( match ) {
          _.set( currentTarget, `${currentId}.${match[ 1 ]}`, match[ 2 ] );
        }
      }
    }
  }
  
  if( currentTarget ) {
    _.set( this.result, currentOp, currentTarget );
  }
  traverse( this.result ).forEach( postProcessArray );
  traverse( this.result ).forEach( postProcessTypeConversion );
  return this.result;
};

module.exports = Parser;