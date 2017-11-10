'use strict';
const _         = require('lodash');
const stripAnsi = require('strip-ansi');

function Parser() {
    this.result = {
        add : {},
    };
}

Parser.prototype.parse = function( input ) {
    let stripped      = stripAnsi( input );
    let lines         = stripped.split( '\n' );
    let match         = null;

    for( let line of lines ) {
        match = line.match( /^(.*): Creation complete$/ );
        if( match ) {
            _.set( this.result.add, match[ 1 ], true );
        }
    }

    return this.result;
};

module.exports = Parser;