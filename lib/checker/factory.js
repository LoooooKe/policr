const MochaChecker = require('./mocha/mochaChecker.js');

function create(type, options, args) {
    switch(type) {
        case 'mocha':
            return new MochaChecker(options, args);
    }
};

module.exports.create = create;