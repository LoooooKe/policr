const TerraformImporter = require('./tf/tfImporter.js');
const AWSImporter = require('./aws/awsImporter.js');

function create(type, options, args) {
    switch(type) {
        case 'tf-plan':
            return new TerraformImporter('plan', options, args);
        case 'tf-state':
            return new TerraformImporter('state', options, args);
        case 'aws':
            return new AWSImporter(options, args);
//        case 'cf':
//          return new CfImporter(options, args);
    }
};

module.exports.create = create;