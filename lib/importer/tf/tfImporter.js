var Q = require('q');
var TerraformSupplier = require('../../supplier/tf/tfSupplier.js');
var Plan = require('./plan.js');
var State = require('./state.js');

function TerraformImporter(mode, options, args) {
    this.mode = mode;
    this.options = options;
    this.args = args;
    this.supplier = new TerraformSupplier(options.workdir);
};

TerraformImporter.prototype.import = function() {
    switch(this.mode) {
        case 'plan':
            return this.importPlan();
        case 'state':
            return this.importState();
        default:
            throw Error('mode not supported!');
    }
};

TerraformImporter.prototype.importPlan = function() {
    var deferred = Q.defer();
    this.supplier.plan().then(function(data) {
            deferred.resolve(new Plan().parse(data));
        }).fail(function(err) {
            deferred.reject(new Error(err));
    });
    return deferred.promise;
};

TerraformImporter.prototype.importState = function() {
    var deferred = Q.defer();
    this.supplier.state().then(function(data) {
            deferred.resolve(new State().parse(data));
        }).fail(function(err) {
            deferred.reject(new Error(err));
    });
    return deferred.promise;
};

module.exports = TerraformImporter;