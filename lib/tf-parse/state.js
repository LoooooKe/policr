'use strict';
const _ = require('lodash');
const traverse  = require('traverse');
const debug = require('debug')('tfparse/state');

function Parser() {
  this.result = {
    resource  : {}
  };
}

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

function postProcessMap( node ) {
  if( _.isObject( node ) && node[ '%' ] ) {
    delete node[ '%' ];
    this.update( node );
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
  let state = null;
  if( _.isString( input ) ) {
    state = JSON.parse( input );
  } else {
    state = input;
  }
  if( state.version != 3 ) {
    throw 'Unsupported terraform state file version';
  }
  debug( 'Supported version!' );

  for( let module of state.modules ) {
    const path = module.path.join('.');
    if( path == 'root' ) {
      for( let resourcePath of _.keys( module.resources ) ) {
        if( ! resourcePath.startsWith( 'data' ) && ! resourcePath.startsWith( 'module' ) ) {
          for( let attributePath of _.keys( module.resources[ resourcePath ].primary.attributes ) ) {
            _.set( this.result, `resource.${resourcePath}.${attributePath}`,  module.resources[ resourcePath ].primary.attributes[ attributePath ] );
          }
        }
      }
    }
  }
  
  traverse( this.result ).forEach( postProcessMap );
  traverse( this.result ).forEach( postProcessArray );
  traverse( this.result ).forEach( postProcessTypeConversion );  

  return this.result;
};

module.exports = Parser;