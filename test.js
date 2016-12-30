'use strict';
// const debug = require('debug')('test');
const Plan = require('./lib').Plan;
const plan = new Plan();

console.log( JSON.stringify( plan.parse( require('fs').readFileSync( './test/data/plan.txt', 'utf8' ) ), null, 2 ) );

process.exit(0);

