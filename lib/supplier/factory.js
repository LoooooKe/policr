const TerraformSupplier = require('./tf/tfSupplier.js');

function create(type, args) {
    switch(type) {
        case 'tf':
            return new TerraformSupplier(args);
        case 'cf':
            return new CloudformationSupplier(args);
        case 'f':
            return new FileSupplier(args);
    }
};

module.exports.create = create;