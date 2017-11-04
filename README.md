# Cloudtool based on [Terraform](http://terraform.io)

## Build
    git checkout -b develop origin/develop

    grunt build

## Usage
### Plan (Unit tests)
To check terraform scripts locally without deploying it to the provider, use the *plan* mode. 
Therefore one has to write js tests using mocha testing and chai assertions.

See examples in the test branch: [ Tests ](https://github.com/LoooooKe/cloudtool/tree/develop/examples/)

### State (Integration tests)
To check an actual deployment on the provider using the terraform state, one can use the *state* mode.
Tests are also based on mocha testing and chai assertions and are fully compatible with the unit tests from plan mode.

To check terraform scripts locally without deploying it to the provider, user the plan mode. 
Therefore one has to write js tests using mocha testing and chai assertions.

See examples in the test branch: [ Tests ](https://github.com/LoooooKe/cloudtool/tree/develop/examples/)

### Apply
Executes a terraform plan including tests and afterwards the terraform apply command.

### Destory
Executes a terrafrom destroy -f command.

### CLI
    Usage:
       cloudtool.js [OPTIONS] <command> [ARGS]
     
     Options:
       -t, --tests STRING     tests
       -w, --workdir [STRING] workdir (Default is .)
       -s, --skipTests TRUE   skipTests
       -h, --help             Display help and usage details
     
     Commands:
       apply, destroy, force-unlock, init, plan, state