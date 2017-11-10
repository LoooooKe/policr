var Q = require('q');
var TerraformRunner = require('./tfRunner');
var Plan = require('./parser/plan.js');
var State = require('./parser/state.js');

function TerraformImporter(mode, options, args) {
    this.mode = mode;
    this.options = options;
    this.args = args;
    this.runner = new TerraformRunner(options ? options.workdir : null);
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
    this.runner.plan().then(function(data) {
            deferred.resolve(new Plan().parse(data));
        }).fail(function(err) {
            deferred.reject(new Error(err));
    });
    return deferred.promise;
};

TerraformImporter.prototype.importState = function() {
    var deferred = Q.defer();
    this.runner.state().then(function(data) {
            deferred.resolve(new State().parse(data));
        }).fail(function(err) {
            deferred.reject(new Error(err));
    });
    return deferred.promise;
};

module.exports = TerraformImporter;