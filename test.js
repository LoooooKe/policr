'use strict';
// const debug = require('debug')('test');
const State = require('./lib').State;
const state = new State();

console.log( JSON.stringify( state.parse( require('fs').readFileSync( './test/data/apply/db/terraform.tfstate', 'utf8' ) ), null, 2 ) );

process.exit(0);

