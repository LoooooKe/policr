const MochaChecker = require('./mocha/mochaChecker.js');

function create(type, args) {
    switch(type) {
        case 'mocha':
            return new MochaChecker(args);
    }
};

module.exports.create = create;